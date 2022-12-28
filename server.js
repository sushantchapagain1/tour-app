import mongoose from 'mongoose';
import dotenv from 'dotenv';

// uncaught exception for sync code needs to be in top to know all bugs at the top because of error in other files
// then the error would not be shown.
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log(`Uncaught Exception...`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
import { app } from './app.js';

const port = process.env.PORT || 8000;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_CLUSTER_PASSWORD
);
console.log(DB, 'db string');
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log(`Database connection sucessfull`))
  .catch((err) => console.log(err));

// 4.MAKE SERVER RUN
const server = app.listen(port, () => {
  console.log(`app running on ${port}`);
});

// handle async unhandle exception
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log(`Unhandled Rejection...`);
  server.close(() => {
    process.exit(1);
  });
});
