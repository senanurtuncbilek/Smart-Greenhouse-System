// src/app.ts
import express from "express";
import routes from './routes/index';
import { User, Greenhouse } from './db/models';

import morgan from "morgan"; // gelen istekleri loglamak için
import helmet from "helmet"; // bazı güvenlik açıklarını engellemek için
import cors from "cors"; // farklı originlerden gelen isteklere izin vermek için
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev")); // loglama --> GET /api/users 200 15.123 ms - 143
app.use(cookieParser());

app.use("/api", routes);

export default app;
