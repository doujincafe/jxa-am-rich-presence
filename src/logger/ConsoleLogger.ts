import clc from 'cli-color';
import ILogger from "./ILogger";

export default class ConsoleLogger implements ILogger {
    writeDebug(...args: string[]): void {
        if (!process.env.DEVELOPMENT) return;
        console.log(clc.cyan("[DEBUG]"), ...args.map(x => clc.cyan(x)));
    }

    writeError(...args: string[]): void {
        console.log(clc.red("[ERROR]"), ...args.map(x => clc.red(x)));
    }

    writeInfo(...args: string[]): void {
        console.log(clc.blue("[INFO]"), ...args.map(x => clc.blue(x)));
    }

    writeWarning(...args: string[]): void {
        console.log(clc.yellow("[ERROR]"), ...args.map(x => clc.yellow(x)));
    }
}
