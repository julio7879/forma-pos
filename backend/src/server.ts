import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`[Servidor FORMA] Corriendo en http://localhost:${PORT}`);
  console.log(`[Healthcheck]    http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('[Servidor FORMA] Cerrando servidor...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Servidor FORMA] Cerrando servidor...');
  server.close(() => process.exit(0));
});
