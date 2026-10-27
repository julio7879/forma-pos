import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';

// Configuración de Express, CORS y montaje de rutas /api/*
export const app = express();

app.use(cors());
app.use(express.json());

// Endpoint de verificación de estado
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware centralizado de errores
app.use(errorHandler);

export default app;
