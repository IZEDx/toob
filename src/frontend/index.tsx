
import { h, render } from "preact";
import { App } from "./components/app";
import { RPCBackend, getRPC } from "../shared/rpc";
import { RPC } from "./api";

const appel = document.getElementById("app");

if (appel) {
    render(<App/>, appel);
}

async function load(backend: RPCBackend)
{
    const rpc = getRPC(RPC);
    await rpc.link(backend);
    await backend.link(rpc);

    console.log(await backend.hello("from frontend"));
}