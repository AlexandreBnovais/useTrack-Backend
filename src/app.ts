import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { route } from "./routes/web.ts";
import session from "express-session";

const app = express();

app.use(route);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);
app.use(
    session({
        secret: "state",
    }),
);
app.use(express.json());
app.use(express.urlencoded());

export { app };
