import fs from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";

const imageMimeTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function slugify(value = "item") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

function safeFileName(value = "upload") {
  const parsed = path.parse(value);
  const base = slugify(parsed.name || "upload");
  const ext = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
  return `${base}${ext || ""}`;
}

export function mediaStorageConfig(root) {
  const mediaRoot = path.resolve(root, process.env.OTA_MEDIA_ASSET_PATH || "./data/media-assets");
  return {
    mediaRoot,
    publicBasePath: "/media-assets"
  };
}

export async function storeUploadedMedia({ root, state, profile, file, assetType = "document" }) {
  if (!file) {
    const error = new Error("file_required");
    error.status = 400;
    throw error;
  }

  const config = mediaStorageConfig(root);
  const brand = state.brands.find((item) => item.id === profile.brandId);
  const brandSlug = slugify(brand?.slug || brand?.name || profile.brandId);
  const platformSlug = slugify(profile.platformKey);
  const typeSlug = slugify(assetType);
  const folder = path.join(config.mediaRoot, brandSlug, platformSlug, typeSlug);
  await fs.mkdir(folder, { recursive: true });

  const storedFileName = `${Date.now()}-${safeFileName(file.originalname)}`;
  const absolutePath = path.join(folder, storedFileName);
  await fs.writeFile(absolutePath, file.buffer);

  const relativePath = path.relative(config.mediaRoot, absolutePath).split(path.sep).join("/");
  const publicUrl = `${config.publicBasePath}/${relativePath}`;
  const metadata = {
    originalName: file.originalname,
    storedFileName,
    fileName: file.originalname,
    storagePath: relativePath,
    publicUrl,
    mimeType: file.mimetype || "application/octet-stream",
    fileSizeBytes: file.size,
    width: "",
    height: "",
    durationSeconds: ""
  };

  if (imageMimeTypes.has(metadata.mimeType)) {
    try {
      const dimensions = imageSize(file.buffer);
      metadata.width = dimensions.width || "";
      metadata.height = dimensions.height || "";
    } catch {
      metadata.dimensionStatus = "unreadable";
    }
  }

  if (metadata.mimeType.startsWith("video/")) {
    metadata.durationStatus = "duration_detection_pending";
  }

  return metadata;
}
