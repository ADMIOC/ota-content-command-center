import fs from "node:fs/promises";
import path from "node:path";
import { notionStatus } from "./notionAdapter.mjs";
import { persistenceStatus } from "./persistenceAdapter.mjs";
import { getRestreamIntegrationStatus } from "./restreamAdapter.mjs";
import { secretStatus } from "./secretStore.mjs";

const notionSourceEnv = [
  "NOTION_SOCIAL_BRANDS_DATA_SOURCE_ID",
  "NOTION_SOCIAL_PROFILES_DATA_SOURCE_ID",
  "NOTION_SOCIAL_MEDIA_ASSETS_DATA_SOURCE_ID",
  "NOTION_SOCIAL_EVIDENCE_DATA_SOURCE_ID",
  "NOTION_RESTREAM_CANDIDATES_DATA_SOURCE_ID",
  "NOTION_SOCIAL_AUDIT_EVENTS_DATA_SOURCE_ID"
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function envConfigured(name) {
  return Boolean(process.env[name]);
}

function check(id, label, ok, blocker, detail) {
  return {
    id,
    label,
    status: ok ? "pass" : blocker ? "blocker" : "warning",
    detail,
    remediation: remediationFor(id)
  };
}

function remediationFor(id) {
  const catalog = {
    build: {
      owner: "Codex",
      actionMode: "agent_solvable",
      why: "The hosted app needs a fresh production bundle before any deploy can be trusted.",
      fixSteps: ["Run npm run build.", "Confirm dist/app.html and hashed assets exist.", "Re-check the deployment gate."],
      codexAction: "Build production bundle",
      humanAction: "None unless the build fails."
    },
    notion_token: {
      owner: "Operator",
      actionMode: "credential_required",
      why: "The command center cannot use Notion as the live control plane until an integration token is available to the backend.",
      fixSteps: ["Create or select the Notion integration for OTA Social Engine.", "Grant it access to the Social Profile by Brand workspace/pages.", "Set NOTION_TOKEN in the server environment or deploy secret manager.", "Restart the backend and re-check the gate."],
      codexAction: "Validate token presence after it is provided",
      humanAction: "Provide the Notion integration token through the approved secret path.",
      environmentVars: ["NOTION_TOKEN"]
    },
    notion_sources: {
      owner: "Codex + Operator",
      actionMode: "guided_setup",
      why: "The frontend needs stable Notion data source IDs for brands, profiles, assets, Restream candidates, and audit events.",
      fixSteps: ["Codex defines the exact Notion database/data-source schema.", "Operator confirms or grants Notion workspace access.", "Codex maps each data source ID into environment variables.", "Re-check the gate."],
      codexAction: "Create or map Notion data source schema when Notion access is available",
      humanAction: "Approve/grant access to the target Notion workspace.",
      environmentVars: notionSourceEnv
    },
    secret_store: {
      owner: "Operator",
      actionMode: "credential_required",
      why: "Hosted production needs a stable encryption key from the environment; a generated local key file is not acceptable for durable production secrets.",
      fixSteps: ["Generate a strong secret-store key.", "Save it in AWS Secrets Manager, SSM Parameter Store, or the deploy platform secret store.", "Set OTA_SECRET_STORE_KEY for the backend runtime.", "Restart and re-check the gate."],
      codexAction: "Generate a local development key only; production storage must be operator-approved.",
      humanAction: "Approve/store the production secret key.",
      environmentVars: ["OTA_SECRET_STORE_KEY"]
    },
    asset_storage: {
      owner: "Codex + Operator",
      actionMode: "architecture_required",
      why: "Observed/uploaded profile media must live in durable object storage, not the local filesystem, before hosted production.",
      fixSteps: ["Choose S3, Cloudflare R2, Bunny Storage, or equivalent.", "Create bucket/container and access policy.", "Set asset storage environment variables.", "Run an upload smoke test and re-check the gate."],
      codexAction: "Wire the selected storage adapter after credentials are available.",
      humanAction: "Choose/provider-create the durable storage target.",
      environmentVars: ["ASSET_STORAGE_MODE"]
    },
    restream: {
      owner: "Codex",
      actionMode: "agent_solvable",
      why: "Restream can operate through per-profile OAuth secret refs; a global token is optional.",
      fixSteps: ["Keep per-profile OAuth refs stored.", "Validate connected channels.", "Re-check when connector policy changes."],
      codexAction: "Validate Restream candidate and refresh token flow.",
      humanAction: "None unless OAuth consent expires."
    },
    auth: {
      owner: "Operator",
      actionMode: "credential_required",
      why: "A hosted command center must not expose brand controls without an operator auth gate.",
      fixSteps: ["For first hosted MVP, generate OTA_ADMIN_TOKEN and store it as a deploy secret.", "For enterprise posture, configure AUTH_PROVIDER with SSO/Cognito/etc.", "Restart and re-check the gate."],
      codexAction: "Wire token/provider enforcement once the chosen auth path is selected.",
      humanAction: "Choose MVP admin token or full auth provider.",
      environmentVars: ["OTA_ADMIN_TOKEN", "AUTH_PROVIDER"]
    },
    production_schema: {
      owner: "Codex",
      actionMode: "agent_solvable",
      why: "Production database structure must be versioned before data is moved out of local JSON.",
      fixSteps: ["Confirm migration file exists.", "Apply migration to the selected Postgres target.", "Run schema smoke checks."],
      codexAction: "Maintain and apply migration when database access is available.",
      humanAction: "Provide database access."
    },
    persistence_adapter: {
      owner: "Codex",
      actionMode: "agent_solvable",
      why: "The backend must read and write through the selected persistence adapter instead of hard-coded local files.",
      fixSteps: ["Select local-json for development or postgres for hosted production.", "Set PERSISTENCE_MODE.", "Run read/write smoke tests."],
      codexAction: "Wire and test the active adapter.",
      humanAction: "Approve production persistence target."
    },
    postgres_config: {
      owner: "Operator",
      actionMode: "credential_required",
      why: "Hosted production needs a managed Postgres connection before the command center can become durable and multi-operator safe.",
      fixSteps: ["Create the RDS/Supabase/Neon Postgres target.", "Apply db/migrations/001_production_data_model.sql.", "Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER in deploy secrets.", "Set PERSISTENCE_MODE=postgres.", "Restart and re-check the gate."],
      codexAction: "Apply migrations and run smoke tests after credentials are available.",
      humanAction: "Provide the managed database connection through the approved secret path.",
      environmentVars: ["DATABASE_URL", "PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD", "PERSISTENCE_MODE"]
    },
    state: {
      owner: "Codex",
      actionMode: "agent_solvable",
      why: "Local state is fine for development but must be replaced or exported before production.",
      fixSteps: ["Confirm local state path for MVP.", "Move production data to Postgres before hosted deploy.", "Keep JSON only as backup/export."],
      codexAction: "Export local state and migrate once Postgres exists.",
      humanAction: "Approve migration timing."
    },
    server: {
      owner: "Codex",
      actionMode: "agent_solvable",
      why: "The backend must run in the intended mode for the deploy target.",
      fixSteps: ["Confirm runtime environment.", "Set production flags only for hosted deploy.", "Re-check gate."],
      codexAction: "Configure runtime command and health checks.",
      humanAction: "Approve target host."
    }
  };
  return catalog[id] || {
    owner: "Codex",
    actionMode: "review_required",
    why: "This check needs review before it can be cleared.",
    fixSteps: ["Review the check detail.", "Apply the required fix.", "Re-check the gate."],
    codexAction: "Review and propose the next patch.",
    humanAction: "Approve any external account changes."
  };
}

export async function deploymentStatus({ root, isProduction = false, serverMode = "local" }) {
  const distReady = await exists(path.join(root, "dist", "app.html"));
  const schemaReady = await exists(path.join(root, "db", "migrations", "001_production_data_model.sql"));
  const notion = notionStatus();
  const restream = getRestreamIntegrationStatus();
  const secrets = secretStatus(root);
  const persistence = persistenceStatus(root);
  const notionSourcesConfigured = notionSourceEnv.every(envConfigured);
  const secretKeyConfigured = envConfigured("OTA_SECRET_STORE_KEY") || secrets.keySource === "environment";
  const adminAuthConfigured = envConfigured("OTA_ADMIN_TOKEN") || envConfigured("AUTH_PROVIDER");
  const assetStorageMode = process.env.ASSET_STORAGE_MODE || "local-filesystem";
  const statePath = process.env.OTA_SOCIAL_STATE_PATH || "./data/social-engine-state.json";

  const checks = [
    check("build", "Production build", distReady, true, distReady ? "dist/app.html exists." : "Run npm run build before deploying."),
    check("server", "Node server", true, false, `Server mode: ${serverMode}. Production flag: ${isProduction ? "enabled" : "disabled"}.`),
    check("state", "State path", Boolean(statePath), true, `State path: ${statePath}. Use durable storage or a managed database for hosted production.`),
    check("notion_token", "Notion token", notion.tokenConfigured, true, notion.tokenConfigured ? "Notion token configured." : "NOTION_TOKEN is missing."),
    check("notion_sources", "Notion data sources", notionSourcesConfigured, true, notionSourcesConfigured ? "All Notion data source IDs are configured." : `Missing data sources: ${notion.missingSources.join(", ") || "unknown"}.`),
    check("secret_store", "Secret-store key", secretKeyConfigured, true, secretKeyConfigured ? "Secret key is provided by environment." : "OTA_SECRET_STORE_KEY should be set for hosted production; do not depend on a generated local key file."),
    check("asset_storage", "Asset storage", assetStorageMode !== "local-filesystem", false, assetStorageMode === "local-filesystem" ? "Local filesystem is acceptable for local MVP only. Use durable object storage for hosted production." : `Storage mode: ${assetStorageMode}.`),
    check("restream", "Restream credential path", restream.enabled || restream.supportsTokenSecretRef, false, restream.enabled ? "RESTREAM_ACCESS_TOKEN configured." : "Restream can use per-profile OAuth secret refs; global RESTREAM_ACCESS_TOKEN is optional."),
    check("auth", "Operator authentication", adminAuthConfigured, true, adminAuthConfigured ? "Auth control is configured." : "OTA_ADMIN_TOKEN or AUTH_PROVIDER is missing."),
    check("production_schema", "Production data model", schemaReady, true, schemaReady ? "Postgres migration 001 is present." : "Production Postgres migration is missing."),
    check("persistence_adapter", "Persistence adapter", true, false, `Active adapter: ${persistence.activeAdapter}.`),
    check("postgres_config", "Postgres/RDS configuration", persistence.postgresConfigured, true, persistence.postgresConfigured ? `Postgres connection configured through ${persistence.postgresConnectionSource}.` : "DATABASE_URL or PGHOST/PGDATABASE/PGUSER is missing.")
  ];

  const blockers = checks.filter((item) => item.status === "blocker");
  const warnings = checks.filter((item) => item.status === "warning");
  return {
    phase: 9,
    phaseLabel: "Phase 9C-2 production persistence adapter",
    mode: isProduction ? "production" : "local",
    serverMode,
    readyForHostedProduction: blockers.length === 0,
    blockers,
    warnings,
    checks,
    recommendedArchitecture: {
      posture: "enterprise-lite",
      hosting: "AWS App Runner or ECS Fargate",
      primaryDatabase: "Amazon RDS Postgres Multi-AZ for production",
      assetStorage: "Amazon S3 with versioning and encryption",
      secretStore: "AWS Secrets Manager or SSM Parameter Store",
      auth: "Cognito, SSO, or private admin-token gate for first hosted MVP",
      audit: "Postgres audit table plus S3 export snapshots",
      dataModel: "db/migrations/001_production_data_model.sql",
      persistenceAdapter: "server/persistenceAdapter.mjs",
      deploymentRule: "No external deploy until the blindspot gate is reviewed and the user explicitly authorizes the target."
    },
    publicConfig: {
      port: Number(process.env.PORT || 5174),
      assetStorageMode,
      statePath,
      notionMode: notion.mode,
      persistenceMode: persistence.mode,
      secretStoreMode: secrets.mode,
      restreamApiBase: restream.apiBase
    }
  };
}
