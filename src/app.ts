import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { route } from "./routes/web.js";
import swaggerUi from "swagger-ui-express";
import { openapiSpecification } from "./shared/libs/swagger.js";

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
        allowedHeaders: ["Authorization", "Content-Type"],
    }),
);
app.use("/", route);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

export { app };
