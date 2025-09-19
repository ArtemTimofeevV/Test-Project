import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { setupSwagger } from './swagger';
import productRoutes from './routes/products';

const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Route setup
app.use('/', productRoutes);

// Swagger setup
setupSwagger(app);

// IIFE to handle async initialization
(async () => {
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
})();
