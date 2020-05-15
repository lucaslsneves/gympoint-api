import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import bullBoard from 'bull-board';

import routes from './routes';
import Queue from './app/lib/Queue';

import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(cors());
    bullBoard.setQueues(Queue.queues.map((queue) => queue.bull));
    this.server.use('/admin/queues', bullBoard.UI);
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
