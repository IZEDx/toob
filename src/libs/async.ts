// Async Hacks
if (!Symbol.asyncIterator) {
    (Symbol as any).asyncIterator = Symbol.for("asyncIterator");
}
export interface IAsyncIterable<T> {[Symbol.asyncIterator](): AsyncIterator<T>; }

/**
 * An IObservable exposes an observe() method that returns an Observable.
 */
export type ISubject<T, K> = IObserver<T> & {
    observe(): Observable<K>;
};

/**
 * An Observer can subscribe on an Observable,
 * after which its functions will be called by the Observable.
 */
export interface IObserver<T> {
    next(value: T): Promise<void>|void;
    error?(error: Error): Promise<void>|void;
    complete?(): Promise<void>|void;
}

/**
 * A Handler is an Observer that handles a value for a client.
 */
export interface IHandler<T, K, I> {
    handle(value: T, client: I): Promise<K>|K;
    error?(error: Error): Promise<void>|void;
    complete?(): Promise<void>|void;
}

/**
 * An AsyncOperator is a function that takes an AsyncIterable and returns an AsyncIterable.
 */
export type AsyncOperator<T, K = T> = (input: IAsyncIterable<T>, ...args: any[]) => IAsyncIterable<K>;

/**
 * Collection of asynchronous generator functions.
 */
export namespace AsyncGenerators {

    /**
     * Creates an async iterable that emits the given arguments and awaits them in case they're promises.
     */
    export async function* of<T>(...values: (T|Promise<T>)[]): IAsyncIterable<T> {
        for (const v of values) {
            yield (v instanceof Promise) ? await v : v;
        }
    }

    /**
     * Creates an async iterable that acts like a for-loop.
     * @param {number} from Startnumber
     * @param {number} to Endnumber
     * @param {number} step Stepsize
     */
    export async function* range(from: number, to: number, step: number = 1): IAsyncIterable<number> {
        for (let i = from; i < to; i += step) {
            yield i;
        }
    }

    /**
     * Creates an async iterable.
     * @param {(observer: IObserver<T>) => void} creator Callback to create the iterable.
     */
    export function create<T>(creator: (observer: IObserver<T>) => void): AsyncIterable<T> {
        return {
            [Symbol.asyncIterator]() {
                let waitingNext: null | ((data: IteratorResult<T>) => void) = null;
                let waitingError: (err: Error) => void;
                const queue: IteratorResult<T>[] = [];

                creator({
                    next(value: T) {
                        if (waitingNext === null) {
                            queue.push({value, done: false});
                        } else {
                            waitingNext({value, done: false});
                            waitingNext = null;
                        }
                    },
                    // Any hack because TypeScript doesn't like IteratorResults with undefined values.
                    complete() {
                        if (waitingNext === null) {
                            queue.push({value: undefined, done: true} as any);
                        } else {
                            waitingNext({value: undefined, done: true} as any);
                            waitingNext = null;
                        }
                    },
                    error(err: Error) {
                        if (waitingError !== undefined) {
                            waitingError(err);
                        }
                    }
                });

                return {
                    next(): Promise<IteratorResult<T>> {
                        return new Promise<IteratorResult<T>>((resolve, reject) => {
                            waitingError = reject;
                            if (queue.length === 0) { return waitingNext = resolve; }

                            resolve(queue[0]);
                            queue.splice(0, 1);
                        });
                    }
                };
            }
        };
    }
}

/**
 * Collection of asynchronous operator functions.
 */
export namespace AsyncOperators {

    /**
     * Maps all incoming values using the given mapping function.
     * @param {IAsyncIterable<T>} input Input
     * @param {(value: T) => Promise<K>} fn Mapping function
     * @return {IAsyncIterable<K>} Output
     */
    export async function* map<T, K>(input: IAsyncIterable<T>, fn: (value: T) => Promise<K>|K): IAsyncIterable<K> {
        for await(const data of input) {
            const mapped = fn(data);
            yield mapped instanceof Promise ? await mapped : mapped;
        }
    }

    /**
     * Splits all incoming values at the given seperator.
     * @param {IAsyncIterable<string>} input Input
     * @param {string} seperator Seperator to split at
     * @return {IAsyncIterable<string>} Output
     */
    export async function* split(input: IAsyncIterable<string>, seperator: string): IAsyncIterable<string> {
        for await(const data of input) {
            for (const part of data.split(seperator)) {
                yield part;
            }
        }
    }

    /**
     * Buffers and splits incoming data using the given seperator.
     * @param {IAsyncIterable<string>} input Input
     * @param {string} seperator Seperator to split and buffer at
     * @return {IAsyncIterable<string>} Output
     */
    export async function* buffer(input: IAsyncIterable<string>, seperator: string): IAsyncIterable<string> {
        let buff = "";

        for await(const data of input) {
            buff += data;
            let idx = buff.indexOf(seperator);

            while (idx >= 0) {
                yield buff.substr(0, idx);
                buff = buff.substr(idx + seperator.length);
                idx = buff.indexOf(seperator);
            }
        }
    }

    /**
     * Filters incoming value using the given predicate.
     * @param {IAsyncIterable<T>} input Input
     * @param {(value: T) => Promise<boolean>} fn Predicate
     * @return {IAsyncIterable<T>} Output
     */
    export async function* filter<T>(input: IAsyncIterable<T>, fn: (value: T) => Promise<boolean>|boolean): IAsyncIterable<T> {
        for await(const data of input) {
            const check = fn(data);
            if (check instanceof Promise ? await check : check) {
                yield data;
            }
        }
    }

    /**
     * Runs and awaits the given async function and then passes the values along.
     * @param {IAsyncIterable<T>} input Input
     * @param {(value: T) => Promise<void>} fn Function
     * @return {IAsyncIterable<T>} Output
     */
    export async function* forEach<T>(input: IAsyncIterable<T>, fn: (value: T) => Promise<void>|void): IAsyncIterable<T> {
        for await(const data of input) {
            const run = fn(data);
            if (run instanceof Promise) {
                await fn(data);
            } else {
                fn(data);
            }
            yield data;
        }
    }

    /**
     * Creates an Observable of every incoming value using the given Function and then yields the values of that.
     * @param {IAsyncIterable<T>} input Input
     * @param {(value: T) => Observable<K>} fn Function
     * @return {IAsyncIterable<K>} Output
     */
    export async function* flatMap<T, K>(input: IAsyncIterable<T>, fn: (value: T) => Observable<K>): IAsyncIterable<K> {
        for await(const data of input) {
            for await(const resultData of fn(data)) {
                yield resultData;
            }
        }
    }

    /**
     * Uses the given Handler to modify every passing value asynchronously.
     * @param {IAsyncIterable<T>} input Input
     * @param {IHandler<T,K>} handler The handler used to modify passing value
     * @param {IObserver<K>} client The client the handler is handling for
     * @return {IAsyncIterable<K>} Output
     */
    export async function* handle<T, K = T, I = IObserver<K>>(
        input: IAsyncIterable<T>,
        handler: IHandler<T, K, I>,
        client: I
    ): IAsyncIterable<K> {
        for await(const value of input) {
            yield await handler.handle(value, client);
        }
    }
}

/**
 * An Observable produces an asynchronous stream of values once iterated over or subscribed on.
 * Observable methods operate on the asynchronous stream of values as they come by returning a new observable.
 * Using this it's possible to create an asynchronous operator chain.
 *
 * eg.
 * ```
 *  const myObservable = Observable.for(0, 100, 10).map(i => i += 5);
 *
 *  myObservable.subscribe({next: console.log});
 *
 *  for await(const i of myObservable) {
 *      console.log(i);
 *  }
 * ```
 */
export class Observable<T> {
    public [Symbol.asyncIterator]: () => AsyncIterator<T>;

    constructor(ai: IAsyncIterable<T>) {
        Object.assign(this, ai);
    }

    public static of<T>(...values: (T|Promise<T>)[]): Observable<T> {
        return new Observable(AsyncGenerators.of(...values));
    }

    public static create<T>(creator: (observer: IObserver<T>) => void): Observable<T> {
        return new Observable(AsyncGenerators.create(creator));
    }
    
    public static listen<T>(stream: NodeJS.ReadableStream): Observable<T> {
        return new Observable(AsyncGenerators.create(observer => {
            stream.on("error", err      => observer.error !== undefined ? observer.error(err) : null);
            stream.on("close", hadError => observer.complete !== undefined ? observer.complete() : null);
            stream.on("data",  data     => observer.next(data));
        }));
    }

    public static interval(ms: number): Observable<number> {
        return new Observable(AsyncGenerators.create(observer => {
            let i = 0;
            setInterval(
                () => {
                    observer.next(i);
                    i += 1;
                },
                ms
            );
        }));
    }

    public static range(from: number, to: number, step: number = 1): Observable<number> {
        return new Observable(AsyncGenerators.range(from, to, step));
    }

    public checkValid(): Observable<T> {
        return this.filter(v => v !== undefined && v !== null);
    }

    public do(fn: (value: T) => Promise<void>|void): Observable<T> {
        return this.forEach(fn);
    }

    public pipe(consumer: IObserver<T>): Promise<void> {
        return this.subscribe(consumer);
    }

    public forEach(fn: (value: T) => Promise<void>|void): Observable<T> {
        return new Observable(AsyncOperators.forEach(this, fn));
    }

    public async subscribe(consumer: IObserver<T>): Promise<void> {
        try {
            for await(const data of this) {
                const r = consumer.next(data);
                if (r instanceof Promise) {
                    await r;
                }
            }
        } catch (e) {
            if (consumer.error !== undefined) {
                const r = consumer.error(e);
                if (r instanceof Promise) {
                    await r;
                }
            }
        }

        if (consumer.complete !== undefined) {
            const r = consumer.complete();
            if (r instanceof Promise) {
                await r;
            }
        }
    }

    public filter(fn: (value: T) => Promise<boolean>|boolean): Observable<T> {
        return new Observable(AsyncOperators.filter(this, fn));
    }

    public map<K>(fn: (value: T) => Promise<K>|K): Observable<K> {
        return new Observable(AsyncOperators.map(this, fn));
    }

    public flatMap<K>(fn: (value: T) => Observable<K>): Observable<K> {
        return new Observable(AsyncOperators.flatMap(this, fn));
    }

    public handle<K, I = IObserver<K>>(handler: IHandler<T, K, I>, client: I): Observable<K> {
        return new Observable(AsyncOperators.handle(this, handler, client));
    }

}