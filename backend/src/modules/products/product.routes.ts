import { Router } from 'express';
import { productController } from './product.controller';

const productRouter = Router();

productRouter.get('/', productController.list);
productRouter.get('/:id', productController.getById);

export default productRouter;