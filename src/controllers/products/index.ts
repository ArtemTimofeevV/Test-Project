import { PRODUCT_REPOSITORY } from '../../repositories';
import { Request, Response } from 'express';

export class PRODUCT_CONTROLLER {
  static async GET_ALL(req: Request, res: Response) {
    const products = await PRODUCT_REPOSITORY.find();
    res.json(products);
  }

  static async GET_BY_ID(req: Request, res: Response) {
    const product = await PRODUCT_REPOSITORY.findOneBy({ product_id: Number(req.params.id) });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  }

  static async CREATE(req: Request, res: Response) {
    const newProduct = PRODUCT_REPOSITORY.create(req.body);
    await PRODUCT_REPOSITORY.save(newProduct);
    res.status(201).json(newProduct);
  }

  static async UPDATE(req: Request, res: Response) {
    const product = await PRODUCT_REPOSITORY.findOneBy({ product_id: Number(req.params.id) });
    if (product) {
      PRODUCT_REPOSITORY.merge(product, req.body);
      const result = await PRODUCT_REPOSITORY.save(product);
      return res.json(result);
    }
    res.status(404).json({ message: 'Product not found' });
  }

  static async DELETE(req: Request, res: Response) {
    const result = await PRODUCT_REPOSITORY.delete(req.params.id);
    if (result.affected === 0) {
        return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(204).send();
  }

  static async LIKE(req: Request, res: Response) {
    const product = await PRODUCT_REPOSITORY.findOneBy({ product_id: Number(req.params.id) });
    if (product) {
      product.likes++;
      const result = await PRODUCT_REPOSITORY.save(product);
      return res.json(result);
    }
    res.status(404).json({ message: 'Product not found' });
  }

  static async DISLIKE(req: Request, res: Response) {
    const product = await PRODUCT_REPOSITORY.findOneBy({ product_id: Number(req.params.id) });
    if (product) {
      product.dislikes++;
      const result = await PRODUCT_REPOSITORY.save(product);
      return res.json(result);
    }
    res.status(404).json({ message: 'Product not found' });
  }
}