import cors from 'cors';
import express from 'express';
import productRoutes from './routes/products';
import { AppDataSource } from './data-source';
import { setupSwagger } from './swagger';

const APP = express();
const PORT = 3000;

APP.use(cors());
APP.use(express.json());

APP.use('/', productRoutes);

setupSwagger(APP);

export const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    APP.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (ERR) {
    console.error('Error during Data Source initialization', ERR);
  }
};