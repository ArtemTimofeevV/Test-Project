import cors from 'cors';
import express from 'express';
import productRoutes from './routes/products';
import { APP_DATA_SOURCE } from './data-source';
import { SETUP_SWAGGER } from './swagger';

const APP = express();
const PORT = 3000;

APP.use(cors());
APP.use(express.json());

APP.use('/', productRoutes);

SETUP_SWAGGER(APP);

export const START_SERVER = async () => {
  try {
    await APP_DATA_SOURCE.initialize();
    console.log('Data Source has been initialized!');

    APP.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (ERR) {
    console.error('Error during Data Source initialization', ERR);
  }
};
