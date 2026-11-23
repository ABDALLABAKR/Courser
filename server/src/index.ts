import { loadConfig } from './config';
import { createApp } from './app';

process.removeAllListeners('warning');
process.on('warning', (w) => { if (w.name !== 'ExperimentalWarning') console.warn(w); });

const config = loadConfig();
const app = createApp(config);
const port = await app.listen();
console.log(`WÊNE BIKÊŞE server listening on http://${config.host}:${port}`);
if (!config.adminPasswordHash) console.warn('ADMIN_PASSWORD_HASH not set — admin dashboard login is disabled. Run `npm run hash-password`.');
if (config.allowUnreviewedWords) console.warn('ALLOW_UNREVIEWED_WORDS is on — unreviewed demo words can appear in games.');

const shutdown = async () => {
  console.log('Shutting down…');
  await app.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
