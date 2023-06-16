import * as DiscordRPC from 'discord-rpc';
import ILogger from "./logger/ILogger";

export type RichPresenceContents = {
    details?: string;
    state?: string;
    startTimestamp?: Date;
    endTimestamp?: Date;
    largeImageKey?: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
    instance: boolean;
}

export default class DiscordRichPresence {
    private readonly _instance: DiscordRPC.Client;
    private _started: boolean = false;
    private readonly _logger: ILogger;

    constructor(clientId: string, logger: ILogger) {
        this._logger = logger;
        this._instance = new DiscordRPC.Client({ transport: 'ipc' });
        this._instance.login({ clientId })
            .then(() => {
                this._started = true;
                this._logger.writeInfo('Started!');
            })
            .catch(e => {
                this._logger.writeError('Unable to connect due to an error:', e.message);
            });
    }

    applyState(state: RichPresenceContents) {
        if (!this._started) return;

        this._instance.setActivity(state)
            .catch(e => {
                this._logger.writeError('An error occurred during application of activity: ', e.message);
            });
    }
}
