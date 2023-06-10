import axios, {AxiosInstance} from "axios";
import Cache from './Cache';
import crypto from 'crypto';
import fetchAlbumArt from "./applescript/fetchAlbumArt";
import ILogger from "./logger/ILogger";
import config from '../config';
import {DateTime} from "luxon";

export default class Uploader {
    private _uploaderInstance: AxiosInstance | null = null;
    private readonly _cache: Cache;
    private readonly _baseURL: string = config.serverHostname;
    private readonly _logger: ILogger;
    private _nextUpdate: number = 0;

    private readonly _username: string = config.serverUsername;
    private readonly _password: string = config.serverPassword;

    constructor(cache: Cache, logger: ILogger) {
        this._cache = cache;
        this._logger = logger;

        if (!config.enableUploader) return;
    }

    private async refreshJob() {
        const res = await axios.post(`${this._baseURL}/api/auth`, { u: this._username, p: this._password });
        if (res.data.success) {
            this._uploaderInstance = axios.create({
                baseURL: this._baseURL, // Azure URL base
                headers: {
                    "User-Agent": "jxa-am 1.1.0.0 uploader",
                    "Authorization": "Bearer " + res.data.token
                }
            });
        }

        this._nextUpdate = DateTime.now().plus({ minute: 5 }).toJSDate().getTime();
    }

    private async checkForRefresh() {
        if (!this._nextUpdate) {
            return await this.refreshJob();
        }

        if (DateTime.now().toJSDate().getTime() > this._nextUpdate) {
            return await this.refreshJob();
        }
    }

    async uploadArt(albumName: string) {
        if (!config.enableUploader) return;
        if (!this._uploaderInstance) return;

        // Refresh session to avoid refresh when times it is inactive.
        await this.checkForRefresh();

        const name = crypto.createHash('sha1')
            .update(albumName, 'utf-8')
            .digest('hex');

        try {
            const image = await fetchAlbumArt();

            const form = new FormData();
            form.append('id', name);
            form.append('image', new Blob([image]));

            await this._uploaderInstance.post('/api/upload', form);
            await this._cache.addItemToCache(name, `${this._baseURL}/api/image/${name}`);
            this._logger.writeInfo("Successfully uploaded with id:", name);
        } catch (e: any) {
            this._logger.writeWarning("Unable to upload:", e.message);
        }
    }
}
