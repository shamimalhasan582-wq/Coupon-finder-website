import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

function localBridgePlugin() {
  const dbFile = path.resolve(__dirname, '..', '.local_db.json');
  const readDb = () => {
    try {
      if (fs.existsSync(dbFile)) return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    } catch (e) {
      console.error(e);
    }
    return {};
  };

  const writeDb = (data: any) => {
    try {
      fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error(e);
    }
  };

  return {
    name: 'admin-local-bridge-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/local-db', (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(readDb()));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const current = readDb();
              const merged = { ...current, ...payload };
              writeDb(merged);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, data: merged }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '..',
  plugins: [
    react(),
    tailwindcss(),
    localBridgePlugin(),
  ],
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
})
