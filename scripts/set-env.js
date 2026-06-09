// Generates src/environments/environment.ts from environment variables.
// Reads .env for local dev; in CI the vars come from the runner environment.
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

function require_env(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val.trim();
}

const isProduction = process.env['NODE_ENV'] === 'production';

const s = (key) => JSON.stringify(require_env(key));

const content = `// AUTO-GENERATED — do not edit. Run "node scripts/set-env.js" to regenerate.
export const environment = {
  production: ${isProduction},
  finnhubApiKey: ${s('FINNHUB_API_KEY')},
  finnhubWsUrl: ${s('FINNHUB_WS_URL')},
  aws: {
    region: ${s('AWS_REGION')},
    accessKeyIdDyDb: ${s('AWS_ACCESS_KEY_ID_DY_DB')},
    secretAccessKeyDyDb: ${s('AWS_SECRET_ACCESS_KEY_DY_DB')},
    tableName: ${s('AWS_TABLE_NAME')},
  },
};
`;

const outPath = path.resolve(__dirname, '../src/environments/environment.ts');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content);
console.log('environment.ts generated');
