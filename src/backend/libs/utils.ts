
import chalk from "chalk";
import { readFile as rF, writeFile as wF } from "fs";

export {chalk};

export function readFile(path: string, defaultContent?: Buffer): Promise<Buffer>
{
    return new Promise((res, rej) =>
        rF(path, (err, data) => 
            !err 
            ? res(data) 
            : (err.code === "ENOENT" && defaultContent !== undefined
                ? res(defaultContent)
                : rej(err))
        )
    );
}

export function writeFile(path: string, data: string|Buffer|Uint8Array): Promise<void>
{
    return new Promise((res, rej) =>
        wF(path, data, (err) => 
            err !== null
            ? rej(err)
            : res()
        )  
    );
}

/**
 * Does nothing.
 * @param args Anything.
 */
export function nop(...args: string[]) {}

/**
 * Time utilities
 */
export namespace time {
    export const local = () => new Date().toLocaleString();
}


/**
 * Logging utilities
 */
export namespace log {
    /**
     * Logs stuff using a given prefix.
     * @param {string} prefix The prefix to prepend.
     * @param {string[]} msg The actual message.
     */
    function logPrefix(prefix: string, ...msg: string[]) {
        console.log(prefix + "\t" + chalk.gray(time.local()) + "\t", ...msg);
    }

    export const main           = (...msg: string[]) => logPrefix(chalk.red.bold("[birdcage]"), ...msg);
    export const error           = (...msg: string[]) => logPrefix(chalk.red.bold("[ERROR]"), ...msg);
    export const server         = (...msg: string[]) => logPrefix(chalk.blue.bold("[Server]"), ...msg);
    export const interaction    = (...msg: string[]) => logPrefix(chalk.green.bold("[Interaction]"), ...msg);
    export const debug          = (...msg: string[]) => logPrefix(chalk.yellow.bold("[Debug]"), ...msg);
    export const test          = (...msg: string[]) => logPrefix(chalk.green.bold("[Test]"), ...msg);
}

export function randomSequence(length: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!§$%&/()=?{[]}-_.:,;<>|#+~";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }
