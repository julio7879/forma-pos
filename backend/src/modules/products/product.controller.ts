import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';
import { AppError } from '../../middlewares/error.middleware';

export async function listProductsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const categoriaRaw = req.query.categoria;
    const limitRaw = req.query.limit;

    const categoria =
      typeof categoriaRaw === 'string' && categoriaRaw.trim() !== ''
        ? categoriaRaw.trim()
        : undefined;

    let limit: number | undefined;
    if (typeof limitRaw === 'string' && limitRaw.trim() !== '') {
      const parsed = Number(limitRaw);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new AppError('El parámetro "limit" debe ser un entero mayor o igual a 1.', 400, 'INVALID_QUERY');
      }
      limit = parsed;
    }

    const products = await productService.listActiveProducts({ categoria, limit });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return next(error);
  }
}

export async function getProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
}