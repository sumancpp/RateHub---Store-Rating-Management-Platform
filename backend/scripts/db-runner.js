import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const mod = await import('embedded-postgres');
  const EmbeddedPostgres = mod.default;

  const dataDir = path.resolve(__dirname, '../../.postgres-data');
  const port = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432;
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'postgres';
  const dbName = process.env.PGDATABASE || 'ratehub_dev';

  const isInitial = !fs.existsSync(dataDir) || fs.readdirSync(dataDir).length === 0;

  const pg = new EmbeddedPostgres({
    port,
    databaseDir: dataDir,
    user,
    password,
    persistent: true,
  });

  if (isInitial) {
    console.log(`[RateHub DB] Initializing PostgreSQL cluster at ${dataDir}...`);
    fs.mkdirSync(dataDir, { recursive: true });
    await pg.initialise();
  }

  console.log(`[RateHub DB] Starting PostgreSQL on port ${port}...`);
  await pg.start();
  console.log(`[RateHub DB] PostgreSQL is running on port ${port}.`);

  if (isInitial) {
    try {
      console.log(`[RateHub DB] Creating initial database "${dbName}"...`);
      await pg.createDatabase(dbName);
      console.log(`[RateHub DB] Database "${dbName}" created successfully.`);
    } catch (err) {
      if (!err.message?.includes('already exists')) {
        console.warn('[RateHub DB] Notice on db creation:', err.message);
      }
    }
  }

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n[RateHub DB] Stopping PostgreSQL server...');
    try {
      await pg.stop();
      console.log('[RateHub DB] PostgreSQL server stopped.');
    } catch (e) {
      // ignore
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

run().catch((err) => {
  console.error('[RateHub DB] Error running embedded database:', err);
  process.exit(1);
});
