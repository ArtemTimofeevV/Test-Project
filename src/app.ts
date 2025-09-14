import express from 'express';
import cors from 'cors';

import { AppDataSource } from './data-source';
import { setupSwagger } from './swagger';
import productRoutes from './routes/products';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/', productRoutes);

setupSwagger(app);

export const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
    });
  } catch (err) {
    console.error('Error during Data Source initialization', err);
  }
};
