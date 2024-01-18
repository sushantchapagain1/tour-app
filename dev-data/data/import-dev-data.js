import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import Tour from '../../models/tourModel.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_CLUSTER_PASSWORD
);
console.log(DB, 'db string');
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`Database connection sucessfull`))
  .catch((err) => console.log(err));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// import data function in database

const importData = async function () {
  try {
    await Tour.create(tours);
    console.log('Data imported');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// delete all data from database

const deleteAlldata = async function () {
  try {
    await Tour.deleteMany();
    console.log('All Data Deleted Successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv.includes('--import')) importData();
else if (process.argv.includes('--delete')) deleteAlldata();

// node dev-data\data\import-dev-data.js --import
// node dev-data\data\import-dev-data.js --delete
