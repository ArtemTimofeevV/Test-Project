import { PRODUCT_CONTROLLER } from '../controllers/products';
import { Router } from 'express';

const ROUTER = Router();

ROUTER.get('/', PRODUCT_CONTROLLER.GET_ALL);
ROUTER.get('/:id', PRODUCT_CONTROLLER.GET_BY_ID);
ROUTER.post('/', PRODUCT_CONTROLLER.CREATE);
ROUTER.put('/:id', PRODUCT_CONTROLLER.UPDATE);
ROUTER.delete('/:id', PRODUCT_CONTROLLER.DELETE);
ROUTER.post('/:id/like', PRODUCT_CONTROLLER.LIKE);
ROUTER.post('/:id/dislike', PRODUCT_CONTROLLER.DISLIKE);

export default ROUTER;