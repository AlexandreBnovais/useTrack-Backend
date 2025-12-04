import { createServer } from "http";
import { app } from "./app";
import "dotenv/config";

const PORT = Number(process.env.PORT) || Number(process.env.APP_PORT) || 3000;
const HOST = process.env.APP_HOST || "0.0.0.0";

const server = createServer(app);

server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

/* Graceful Shutdown */
const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Closing server...`);

    server.close((err) => {
        if (err) {
            console.error("Error closing server:", err);
            process.exit(1);
        }

        console.log("Server closed cleanly");
        process.exit(0);
    });
};

process.on("SIGINT", () => shutdown("SIGINT"));   // ctrl+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // docker stop
