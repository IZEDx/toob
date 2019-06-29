#! /usr/bin/env node

require("./dist/main.js").main().catch(err => {
    console.error("Fatal Error:\n", err);
});