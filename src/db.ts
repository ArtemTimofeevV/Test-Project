import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in your .env file');
}

export const pool = new Pool({
    connectionString,
});

pool.on('connect', () => {
    console.log('Connected to the database');
});
