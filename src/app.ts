import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { route } from "./routes/web";
import swaggerUi from "swagger-ui-express";
import { openapiSpecification } from "./shared/libs/swagger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Cookies
app.use(cookieParser());

app.use(
    cors({
        origin: ['http://localhost:3000', 'http://192.168.15.8:3000', 'http://127.0.0.1:5501'],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Authorization", "Content-Type"],
    }),
);

app.use("/", route);

app.use("/doc", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

export { app };
