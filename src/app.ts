import express from "express";
import routes from './routes/index';

import { writeLimiter } from "./middlewares/rateLimit";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

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
app.set("trust proxy", 1);
app.use(writeLimiter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use("/api", routes);

export default app;
