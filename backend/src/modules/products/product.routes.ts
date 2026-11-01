import { Router } from 'express';
import { getProductHandler, listProductsHandler } from './product.controller';

export const productRouter = Router();

productRouter.get('/', listProductsHandler);
productRouter.get('/:id', getProductHandler);

export default productRouter;