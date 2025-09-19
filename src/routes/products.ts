import { Router } from 'express';
<<<<<<< HEAD
import { ProductController } from '../../controllers/products';
=======
import { productRepository } from '../repositories';
>>>>>>> d403b6ab02efc8b905cd0020e4da37c5a4438ba0

const router = Router();

// Get all products
router.get('/', ProductController.getAll);

<<<<<<< HEAD
// Get a single product by ID
router.get('/:id', ProductController.getById);

// Create a new product
router.post('/', ProductController.create);

// Update a product
router.put('/:id', ProductController.update);
=======
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/products', async (req, res) => {
  const products = await productRepository.find();

  res.json(products);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: The product was not found
 */
router.get('/products/:id', async (req, res) => {
  const product = await productRepository.findOneBy({ product_id: parseInt(req.params.id) });

  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Product not found');
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The product was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Some server error
 */
router.post('/products', async (req, res) => {
  const newProduct = productRepository.create(req.body);

  await productRepository.save(newProduct);

  res.status(201).json(newProduct);
});
>>>>>>> d403b6ab02efc8b905cd0020e4da37c5a4438ba0

// Delete a product
router.delete('/:id', ProductController.delete);

// Like a product
router.post('/:id/like', ProductController.like);

// Dislike a product
router.post('/:id/dislike', ProductController.dislike);

export default router;