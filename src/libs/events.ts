
export class EventEmitter {
    private listeners: {[key: string]: Function[]} = {};

    emit(event: string, ...args: any[]){
        if(event in this.listeners) {
            for(let fn of this.listeners[event]) {
                setTimeout(() => fn(...args), 0);
            }
        }
    }

    addListener(event: string, fn: Function): number{
        if(!(event in this.listeners)) this.listeners[event] = [];

        return this.listeners[event].push(fn.bind(this));
    }

    removeListener(event: string, idx: number){
        if(!(event in this.listeners)) return;
        
        if(this.listeners[event].length > idx && idx >= 0) {
            this.listeners[event].splice(idx, 1);
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