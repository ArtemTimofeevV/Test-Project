import { Product } from './entities/Product';
import { AppDataSource } from './data-source';

export const productRepository = AppDataSource.getRepository(Product);