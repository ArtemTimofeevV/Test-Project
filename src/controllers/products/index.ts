import { Request, Response } from 'express';
import { productRepository } from '../../repositories';

export class ProductController {
  // Get all products
  static async getAll(req: Request, res: Response) {
    const products = await productRepository.find();
    res.json(products);
  }

  // Get a single product by ID
  static async getById(req: Request, res: Response) {
    const product = await productRepository.findOneBy({ id: Number(req.params.id) });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  }

  // Create a new product
  static async create(req: Request, res: Response) {
    const newProduct = productRepository.create(req.body);
    await productRepository.save(newProduct);
    res.status(201).json(newProduct);
  }

  // Update a product
  static async update(req: Request, res: Response) {
    const product = await productRepository.findOneBy({ id: Number(req.params.id) });
    if (product) {
      productRepository.merge(product, req.body);
      const result = await productRepository.save(product);
      return res.json(result);
    }
    res.status(404).json({ message: 'Product not found' });
  }

  // Delete a product
  static async delete(req: Request, res: Response) {
    const result = await productRepository.delete(req.params.id);
    if (result.affected === 0) {
        return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(204).send();
  }

  // Like a product
  static async like(req: Request, res: Response) {
    const product = await productRepository.findOneBy({ id: Number(req.params.id) });
    if (product) {
      product.likes++;
      const result = await productRepository.save(product);
      return res.json(result);
    }
    res.status(404).json({ message: 'Product not found' });
  }

  // Dislike a product
  static async dislike(req: Request, res: Response) {
    const product = await productRepository.findOneBy({ id: Number(req.params.id) });
    if (product) {
      product.dislikes++;
      const result = await productRepository.save(product);
      return res.json(result);
    }
    res.status(404).json({ message: 'Product not found' });
  }
}
