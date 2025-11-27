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
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Authorization", "Content-Type"],
    }),
);

app.use("/", route);

app.use("/doc", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

export { app };
