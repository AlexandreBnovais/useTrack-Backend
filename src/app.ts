import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import { route } from "./routes/web.ts";
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: [
            "Content-Type", "Authorization",
            "Content-Type", "application/json"
        ],
    }),
);
app.use('/', route);
app.use('/apiDoc', swaggerUi.serve, swaggerUi.setup());

export { app };
