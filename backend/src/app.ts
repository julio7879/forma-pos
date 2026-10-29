import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { orderRouter } from './modules/orders/order.routes';

// Configuración de Express, CORS y montaje de rutas /api/*
export const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de verificación de salud y estado del servidor
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'forma-backend',
      timestamp: new Date().toISOString()
    }
  });
});

// Rutas de módulos del negocio
app.use('/api/orders', orderRouter);

// Captura de rutas inexistentes (404)
app.use(notFoundHandler);

// Middleware centralizado de errores
app.use(errorHandler);

export default app;
