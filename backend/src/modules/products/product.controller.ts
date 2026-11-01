import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categoria =
        typeof req.query.categoria === 'string' ? req.query.categoria : undefined;
      const data = await productService.list(categoria);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Producto no encontrado' },
        });
      }
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },
};