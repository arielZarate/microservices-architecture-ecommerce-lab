import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const adapter = new PrismaPg({
  host: process.env.DATASOURCE_HOST,
  user: process.env.DATASOURCE_USERNAME,
  port: parseInt(process.env.DATASOURCE_PORT!),
  password: process.env.DATASOURCE_PASSWORD,
  database: process.env.DATASOURCE_NAME_DATABASE,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
