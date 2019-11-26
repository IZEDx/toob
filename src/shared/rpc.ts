
let instance: RPC<any, any> = undefined!;

export function getRPC<T extends RPC<T, P>, P extends RPC<P, T>>(
    rpcClass: (new() => T)
)
{
    if (instance) return instance as T;
    
    instance = new rpcClass();
    return instance as T;
}

export class RPC<T extends RPC<T, P>, P extends RPC<P, T>>
{
    constructor()
    {
        instance = this;
    }

    peer!: P;

    async link(peer: P)
    {
        this.peer = peer;
    }

}

export abstract class RPCBackend extends RPC<RPCBackend, RPCFrontend>
{
    abstract hello(name: string): Promise<string>;
}

export abstract class RPCFrontend extends RPC<RPCFrontend, RPCBackend>
{
}
