import { Product } from './entities/Product';
import { APP_DATA_SOURCE } from './data-source';

export const PRODUCT_REPOSITORY = APP_DATA_SOURCE.getRepository(Product);