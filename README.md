## Project Overview
In this app users can login signup and see the tours, authorization where allowed action can be done by allowed users only.

## Getting Started 

1. Clone the repository to your local machine.
2. Install the project dependencies using `npm install or yarn`.
3. Set up your environment variables by creating a `config.env` file in the root directory(see example.config.env).
   you can use only .env also by rewritting dotenv.config({ path: './config.env' }) to dotenv.config({ path: './env' }) in app.js file.
4. Then in mongo db create a cluster and add the username and password of cluster in .env (you can see on exmaple env file also), then copy the mongo url and paste the (<password> to <PASSWORD>) you can see the logic and get it in server.js also.
5. After connection is successful you can run `node dev-data\data\import-dev-data.js --import` to add data in db (you can explore that dev-data file to see more).
6. Run the development server using `npm run start or yarn start`.
7. if you are using bruno(service like POSTMAN or INSOMNIA)  you can import the api-bruno folder to test api.

