import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

server.use(morgan('dev'));

// CORS Configuration
server.use(
  cors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,OPTIONS,PUT,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

server.use(express.urlencoded({extended: false}))
server.use(express.json())

// Static files
server.use('/', express.static(path.join(__dirname, '../public')));
server.use('/public/js', express.static(path.join(__dirname, '../public/js')));
server.use('/public/css', express.static(path.join(__dirname, '../public/css')));
server.use('/public/global_styles', express.static(path.join(__dirname, '../public/global_styles')));
server.use('/public/images', express.static(path.join(__dirname, '../public/images')));

// Main routes
server.use(router);

server.use((err, req, res, next) => {
  console.error('Erro detectado:', err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
});

server.listen(PORT, HOST, () => {
  console.log(`\nApp is listening on http://${HOST}:${PORT}`);
});

export default server;