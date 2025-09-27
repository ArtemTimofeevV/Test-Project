import cors from 'cors';
import express from 'express';
import productRoutes from './routes/products';
import { APP_DATA_SOURCE } from './data-source';
import { setupSwagger } from './swagger';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/', productRoutes);

setupSwagger(app);

export const startServer = async () => {
  try {
    await APP_DATA_SOURCE.initialize();
    console.log('Data Source has been initialized!');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Error during Data Source initialization', err);
  }
};
