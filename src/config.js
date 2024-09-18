import { config } from "dotenv";
config();

//Puerto de app
export const PORT = process.env.PORT;

//BD Mongo
export const DB_HOST = process.env.DB_Host;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT;

