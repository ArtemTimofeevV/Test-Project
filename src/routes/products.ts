import { ProductController } from '../controllers/products';
import { Router } from 'express';

const ROUTER = Router();

ROUTER.get('/', ProductController.getAll);
ROUTER.get('/:id', ProductController.getById);
ROUTER.post('/', ProductController.create);
ROUTER.put('/:id', ProductController.update);
ROUTER.delete('/:id', ProductController.delete);
ROUTER.post('/:id/like', ProductController.like);
ROUTER.post('/:id/dislike', ProductController.dislike);

export default ROUTER;