
import { launch } from "carlo";
import { join } from "path";

const path = (...str: string[]) => join(__dirname, ...str);
const config_path = "./config.json";

export async function main()
{
    const app = await launch({
        args: [
            "--enable-experimental-web-platform-features"
        ]
    });

    app.on('exit', () => process.exit());

    app.serveFolder(path("www"));

    await app.load('index.html');
}