import { PRODUCT_REPOSITORY } from '../../repositories';
import { Request, Response } from 'express';

export class PRODUCT_CONTROLLER {
  static async GET_ALL(req: Request, res: Response) {
    const PRODUCTS = await PRODUCT_REPOSITORY.find();
    res.json(PRODUCTS);
  }

  static async GET_BY_ID(req: Request, res: Response) {
    const PRODUCT = await PRODUCT_REPOSITORY.findOneBy({ product_id: Number(req.params.id) });
    if (PRODUCT) {
      res.json(PRODUCT);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  }

  static async CREATE(req: Request, res: Response) {
    const NEW_PRODUCT = PRODUCT_REPOSITORY.create(req.body);
    await PRODUCT_REPOSITORY.save(NEW_PRODUCT);
    res.status(201).json(NEW_PRODUCT);
  }

  static async UPDATE(req: Request, res: Response) {
    const PRODUCT = await PRODUCT_REPOSITORY.findOneBy({ product_id: Number(req.params.id) });
    if (PRODUCT) {
      PRODUCT_REPOSITORY.merge(PRODUCT, req.body);
      const RESULT = await PRODUCT_REPOSITORY.save(PRODUCT);
      return res.json(RESULT);
    }
    res.status(404).json({ message: 'Product not found' });
  }

  static async DELETE(req: Request, res: Response) {
    const RESULT = await PRODUCT_REPOSITORY.delete(req.params.id);
    if (RESULT.affected === 0) {
        return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(204).send();
  }

  static async LIKE(req: Request, res: Response) {
    const PRODUCT = await PRODUCT_REPOSITORY.findOneBy({ product_id: Number(req.params.id) });
    if (PRODUCT) {
      PRODUCT.likes++;
      const RESULT = await PRODUCT_REPOSITORY.save(PRODUCT);
      return res.json(RESULT);
    }
    res.status(404).json({ message: 'Product not found' });
  }

  static async DISLIKE(req: Request, res: Response) {
    const PRODUCT = await PRODUCT_REPOSITORY.findOneBy({ product_id: Number(req.params.id) });
    if (PRODUCT) {
      PRODUCT.dislikes++;
      const RESULT = await PRODUCT_REPOSITORY.save(PRODUCT);
      return res.json(RESULT);
    }
    res.status(404).json({ message: 'Product not found' });
  }
}