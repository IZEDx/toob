
import { launch } from "carlo";
import { join } from "path";
import { getRPC, RPCFrontend } from "../shared/rpc";
import { RPC } from "./api";

const path = (...str: string[]) => join(__dirname, ...str);
const config_path = "./config.json";

export async function main()
{
    const app = await launch({
        args: [
            "--enable-experimental-web-platform-features"
        ]
    });

    const rpc = getRPC(RPC);

    app.on('exit', () => process.exit());

    app.serveFolder(path("www"));

    await app.load('index.html');
}