import { productsServer } from './server.js';

productsServer().catch(error => {
  console.error(error);
  process.exit(1);
});
