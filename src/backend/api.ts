

import { RPCBackend } from "../shared/rpc";

export class RPC extends RPCBackend
{
    async hello(name: string)
    {
        console.log("Hello %s", name);
        return "Backend is happy";
    }
}
