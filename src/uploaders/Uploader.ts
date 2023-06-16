import axios, {AxiosInstance} from "axios";
import Cache from '../Cache.js';
import crypto from 'crypto';
import fetchAlbumArt from "../applescript/fetchAlbumArt";
import ILogger from "../logger/ILogger";
import config from '../../config';
import {DateTime} from "luxon";
import {IUploader} from "./IUploader";

export default class Uploader implements IUploader {
    private _uploaderInstance: AxiosInstance | null = null;
    private readonly _cache: Cache;
    private readonly _logger: ILogger;
    private _nextUpdate: number = 0;

    private readonly _baseURL: string = config.uploader.custom.serverHostname;
    private readonly _username: string = config.uploader.custom.serverUsername;
    private readonly _password: string = config.uploader.custom.serverPassword;

    constructor(cache: Cache, logger: ILogger) {
        this._cache = cache;
        this._logger = logger;
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
        this._logger.writeInfo('Token updated. Next update:', this._nextUpdate.toString());
    }

    private async checkForRefresh() {
        if (!this._uploaderInstance || DateTime.now().toJSDate().getTime() > this._nextUpdate) {
            return await this.refreshJob();
        }
    }

    async uploadArt(albumName: string) {
        // Refresh session to avoid refresh when times it is inactive.
        try {
            await this.checkForRefresh();
        } catch (e) {
            this._uploaderInstance = null;
        }

        // Do not continue when uploader instance is not set after token refresh.
        if (!this._uploaderInstance || DateTime.now().toJSDate().getTime() > this._nextUpdate) return;

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
        } catch (e: any) {
            this._logger.writeWarning("Unable to upload:", e.message);
        }
    }
}
