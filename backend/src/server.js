import app from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`[RateHub Backend] Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('unhandledRejection', (err) => {
  console.error('[RateHub] Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
