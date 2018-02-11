
export class EventEmitter {
    private listeners: {[key: string]: (Function|undefined)[]} = {};

    emit(event: string, ...args: any[]){
        if(event in this.listeners) {
            for(let fn of this.listeners[event]) {
                if (fn !== undefined) {
                    setImmediate(() => fn !== undefined && fn(...args));
                }
            }
        }
    }

    addListener(event: string, fn: Function): number{
        if(!(event in this.listeners)) this.listeners[event] = [];
        const idx = this.listeners[event].push(fn.bind(this));
        return idx;
    }

    removeListener(event: string, idx: number){
        if(!(event in this.listeners)) return;
        
        if(this.listeners[event].length > idx && idx >= 0) {
            this.listeners[event][idx] = undefined;
        }
    }
 
    on(event: string, fn: Function): Function{
        let idx = this.addListener(event, fn);
        return () => {
            this.removeListener(event, idx);
        }
    }

    once(event: string, fn?: (args: any) => void): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const unsubscribe = this.on(event, (...args: any[]) => {
                unsubscribe();
                if (!!fn) {
                    fn(args);
                }
                resolve(args);
            });
        });
    }
}