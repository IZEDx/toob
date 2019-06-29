
import { createServer } from "http";
import express = require("express");
import { static as serveStatic, Router } from "express";
import { join } from "path";
import { json, urlencoded } from "body-parser";
import session = require("express-session");

import { loadConfig, updateConfig } from "./config";
import { log, randomSequence, readFile } from "./libs/utils";

import { registerAPI } from "./api";
import { Auth } from "./auth";

const path = (...str: string[]) => join(__dirname, ...str);
const config_path = "./config.json";

export async function main()
{
    log.main("Starting server...");

    const config = await loadConfig(config_path);
    if (config.session_secret === "replace me")
    {
        config.session_secret = randomSequence(12);
        await updateConfig({session_secret: config.session_secret}, config_path);
    }

    const auth = new Auth(config_path)
    await auth.load();

    const app = express();
    const server = createServer(app);
    
    app.use(serveStatic(path("www"), { index: ["index.html"] }));
    app.use(urlencoded({ extended: true }));
    app.use(json());
    app.use(session({
        secret: config.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: {}
    }));
    
    const apiRouter = Router();
    registerAPI(apiRouter, auth);
    app.use("/api", apiRouter);

    server.listen(config.ports.admin, () => {
        log.main(`Server started.`);
        log.main(`Admin Panel listening on port ${config.ports.admin}.`);
    });
}