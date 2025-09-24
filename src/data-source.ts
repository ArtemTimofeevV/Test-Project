import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const APP_DATA_SOURCE = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "postgres",
    synchronize: true,
    logging: false,
    entities: [__dirname + "/entities/**/*.{ts,js}"],
    migrations: [],
    subscribers: [],
})