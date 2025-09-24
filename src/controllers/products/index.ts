import { productRepository } from '../../repositories';
import { Request, Response } from 'express';

export class ProductController {
  static async getAll(req: Request, res: Response) {
    const PRODUCTS = await productRepository.find();
    res.json(PRODUCTS);
  }

  static async getById(req: Request, res: Response) {
    const PRODUCT = await productRepository.findOneBy({ product_id: Number(req.params.id) });
    if (PRODUCT) {
      res.json(PRODUCT);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  }

  static async create(req: Request, res: Response) {
    const NEW_PRODUCT = productRepository.create(req.body);
    await productRepository.save(NEW_PRODUCT);
    res.status(201).json(NEW_PRODUCT);
  }

  static async update(req: Request, res: Response) {
    const PRODUCT = await productRepository.findOneBy({ product_id: Number(req.params.id) });
    if (PRODUCT) {
      productRepository.merge(PRODUCT, req.body);
      const RESULT = await productRepository.save(PRODUCT);
      return res.json(RESULT);
    }
    res.status(404).json({ message: 'Product not found' });
  }

  static async delete(req: Request, res: Response) {
    const RESULT = await productRepository.delete(req.params.id);
    if (RESULT.affected === 0) {
        return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(204).send();
  }

  static async like(req: Request, res: Response) {
    const PRODUCT = await productRepository.findOneBy({ product_id: Number(req.params.id) });
    if (PRODUCT) {
      PRODUCT.likes++;
      const RESULT = await productRepository.save(PRODUCT);
      return res.json(RESULT);
    }
    res.status(404).json({ message: 'Product not found' });
  }

  static async dislike(req: Request, res: Response) {
    const PRODUCT = await productRepository.findOneBy({ product_id: Number(req.params.id) });
    if (PRODUCT) {
      PRODUCT.dislikes++;
      const RESULT = await productRepository.save(PRODUCT);
      return res.json(RESULT);
    }
    res.status(404).json({ message: 'Product not found' });
  }
}