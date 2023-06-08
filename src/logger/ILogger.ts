export default interface ILogger {
    writeInfo(...args: string[]): void;
    writeDebug(...args: string[]): void;
    writeError(...args: string[]): void;
    writeWarning(...args: string[]): void;
}

