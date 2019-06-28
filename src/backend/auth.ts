import { loadConfig, Config, updateConfig } from "./config";
import { hash, compare } from "bcrypt";



export class Auth
{
    private password: string = ".";

    constructor(private path: string)
    {
    }

    async load()
    {
        const config = await loadConfig(this.path);
        this.password = config.admin_password;
    }

    async setPassword(pw: string)
    {
        this.password = await hash(pw, 10);
        return updateConfig<Config>({admin_password: this.password});
    }

    async checkPassword(pw: string)
    {
        return this.password === "" || compare(pw, this.password);
    }
}
