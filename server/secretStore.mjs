import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const credentialFields = {
  streamUrl: "streamUrlSecretRef",
  streamKey: "streamKeySecretRef",
  rtmpUsername: "rtmpUsernameSecretRef",
  rtmpPassword: "rtmpPasswordSecretRef",
  restreamAccessToken: "restreamAccessTokenSecretRef",
  restreamClientId: "restreamClientIdSecretRef",
  restreamClientSecret: "restreamClientSecretRef",
  restreamRefreshToken: "restreamRefreshTokenSecretRef"
};

function slugify(value = "item") {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

function secretConfig(root) {
  return {
    mode: process.env.SECRET_STORE_MODE || "local-encrypted",
    storeRoot: path.resolve(root, process.env.OTA_SECRET_STORE_PATH || "./data/secrets"),
    keyPath: path.resolve(root, process.env.OTA_SECRET_KEY_PATH || "./data/secret-store.key")
  };
}

async function getEncryptionKey(config) {
  if (process.env.OTA_SECRET_STORE_KEY) {
    return crypto.createHash("sha256").update(process.env.OTA_SECRET_STORE_KEY).digest();
  }
  try {
    const stored = await fs.readFile(config.keyPath, "utf8");
    return Buffer.from(stored.trim(), "base64");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const key = crypto.randomBytes(32);
    await fs.mkdir(path.dirname(config.keyPath), { recursive: true });
    await fs.writeFile(config.keyPath, `${key.toString("base64")}\n`, { mode: 0o600 });
    return key;
  }
}

export function allowedCredentialTypes() {
  return Object.keys(credentialFields);
}

export function secretStatus(root) {
  const config = secretConfig(root);
  return {
    mode: config.mode,
    storePath: path.relative(root, config.storeRoot),
    keySource: process.env.OTA_SECRET_STORE_KEY ? "environment" : "local_key_file",
    allowedCredentialTypes: allowedCredentialTypes()
  };
}

export function secretRefFor({ brandSlug, platformKey, credentialType }) {
  return `secret://ota-social-engine/${slugify(brandSlug)}/${slugify(platformKey)}/${slugify(credentialType)}`;
}

export function secretRefField(credentialType) {
  return credentialFields[credentialType];
}

export async function writeSecret({ root, brandSlug, platformKey, credentialType, value, actor = "Local Operator" }) {
  if (!credentialFields[credentialType]) {
    const error = new Error("unsupported_credential_type");
    error.status = 400;
    throw error;
  }
  if (!value || typeof value !== "string") {
    const error = new Error("secret_value_required");
    error.status = 400;
    throw error;
  }

  const config = secretConfig(root);
  const key = await getEncryptionKey(config);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const secretRef = secretRefFor({ brandSlug, platformKey, credentialType });
  const record = {
    secretRef,
    credentialType,
    brandSlug: slugify(brandSlug),
    platformKey: slugify(platformKey),
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
    actor,
    createdAt: new Date().toISOString(),
    rotatedAt: new Date().toISOString()
  };

  const folder = path.join(config.storeRoot, record.brandSlug, record.platformKey);
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, `${slugify(credentialType)}.json`), `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
  return {
    secretRef,
    credentialType,
    refField: credentialFields[credentialType],
    rotatedAt: record.rotatedAt
  };
}

function parseSecretRef(secretRef = "") {
  const match = String(secretRef).match(/^secret:\/\/ota-social-engine\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (!match) {
    const error = new Error("invalid_secret_ref");
    error.status = 400;
    throw error;
  }
  return {
    brandSlug: match[1],
    platformKey: match[2],
    credentialType: match[3]
  };
}

export async function readSecret({ root, secretRef }) {
  const config = secretConfig(root);
  const parsed = parseSecretRef(secretRef);
  const filePath = path.join(config.storeRoot, parsed.brandSlug, parsed.platformKey, `${parsed.credentialType}.json`);
  let record;
  try {
    record = JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      const notFound = new Error("secret_not_found");
      notFound.status = 404;
      throw notFound;
    }
    throw error;
  }
  const key = await getEncryptionKey(config);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(record.iv, "base64"));
  decipher.setAuthTag(Buffer.from(record.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(record.ciphertext, "base64")),
    decipher.final()
  ]).toString("utf8");
}
