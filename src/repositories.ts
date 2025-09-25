import { APP_DATA_SOURCE } from './data-source';
import { Product } from './entities/Product';

export const PRODUCT_REPOSITORY = APP_DATA_SOURCE.getRepository(Product);