import fs from "node:fs/promises";
import path from "node:path";

function postgresConfigured() {
  return Boolean(process.env.DATABASE_URL) || Boolean(process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER);
}

function configuredMode() {
  return process.env.PERSISTENCE_MODE || "local-json";
}

export function persistenceStatus(root) {
  const mode = configuredMode();
  const localStatePath = path.resolve(root, process.env.OTA_SOCIAL_STATE_PATH || "./data/social-engine-state.json");
  const postgresReady = postgresConfigured();
  return {
    mode,
    activeAdapter: mode === "postgres" ? "postgres" : "local-json",
    localStatePath: path.relative(root, localStatePath),
    postgresConfigured: postgresReady,
    postgresConnectionSource: process.env.DATABASE_URL ? "DATABASE_URL" : postgresReady ? "PGHOST_PGDATABASE_PGUSER" : "",
    productionReady: mode === "postgres" && postgresReady,
    fallbackActive: mode !== "postgres",
    migration: "db/migrations/001_production_data_model.sql",
    note: mode === "postgres"
      ? "Postgres mode is selected. Production repository wiring is required before external deployment."
      : "Local JSON fallback is active for development. Hosted production must use Postgres/RDS."
  };
}

async function readJsonState({ statePath, seedState }) {
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const seed = seedState();
    await writeJsonState({ statePath, state: seed });
    return seed;
  }
}

async function writeJsonState({ statePath, state }) {
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

export function createPersistenceAdapter({ root, seedState, enhanceState = (state) => state }) {
  const statePath = path.resolve(root, process.env.OTA_SOCIAL_STATE_PATH || "./data/social-engine-state.json");

  async function assertSupportedWriteMode() {
    if (configuredMode() !== "postgres") return;
    const error = new Error("postgres_persistence_adapter_not_wired");
    error.status = 501;
    throw error;
  }

  return {
    status() {
      return persistenceStatus(root);
    },
    async readState() {
      if (configuredMode() === "postgres") {
        const error = new Error("postgres_persistence_adapter_not_wired");
        error.status = 501;
        throw error;
      }
      return enhanceState(await readJsonState({ statePath, seedState }));
    },
    async writeState(state) {
      await assertSupportedWriteMode();
      await writeJsonState({ statePath, state });
    },
    async resetState() {
      await assertSupportedWriteMode();
      const seed = enhanceState(seedState());
      await writeJsonState({ statePath, state: seed });
      return seed;
    },
    async exportState() {
      const state = await this.readState();
      return {
        exportedAt: new Date().toISOString(),
        source: this.status(),
        counts: {
          brands: state.brands?.length || 0,
          profiles: state.profiles?.length || 0,
          assets: (state.profiles || []).reduce((count, profile) => count + (profile.mediaAssets || []).length, 0),
          evidence: (state.profiles || []).reduce((count, profile) => count + (profile.evidence || []).length, 0),
          auditEvents: state.auditEvents?.length || 0
        },
        state
      };
    }
  };
}
