import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { route } from "./routes/web.ts";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(route)
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
app.use(express.json());
app.use(express.urlencoded());

export { app };
