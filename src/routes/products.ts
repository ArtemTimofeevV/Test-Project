import { Router } from 'express';
import { ProductController } from '../../controllers/products';

const router = Router();

// Get all products
router.get('/', ProductController.getAll);

// Get a single product by ID
router.get('/:id', ProductController.getById);

// Create a new product
router.post('/', ProductController.create);

// Update a product
router.put('/:id', ProductController.update);

// Delete a product
router.delete('/:id', ProductController.delete);

// Like a product
router.post('/:id/like', ProductController.like);

// Dislike a product
router.post('/:id/dislike', ProductController.dislike);

export default router;