import express from "express";
import routes from './routes/index';


import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

import morgan from "morgan"; // gelen istekleri loglamak için
import helmet from "helmet"; // bazı güvenlik açıklarını engellemek için
import cors from "cors"; // farklı originlerden gelen isteklere izin vermek için
import cookieParser from "cookie-parser";
import { writeLimiter } from "./middlewares/rateLimit";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());
app.use(morgan("dev")); // loglama --> GET /api/users 200 15.123 ms - 143
app.use(cookieParser());
app.use(writeLimiter);
app.set("trust proxy", 1);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use("/api", routes);

export default app;
