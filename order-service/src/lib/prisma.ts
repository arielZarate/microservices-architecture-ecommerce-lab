
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";


import {PrismaClient} from "../../generated/prisma/client.js";

const adapter = new PrismaPg({ 

  host: process.env.DB_HOST ,
  user: process.env.DB_USER,
  port: parseInt(process.env.DB_PORT!),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

 });
const prisma = new PrismaClient({ adapter });


export default prisma ;


