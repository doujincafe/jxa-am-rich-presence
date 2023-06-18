import * as fs from 'fs';
import * as fsp from 'fs/promises';
import path from 'path';
import Cache from "../Cache.js";
import {IUploader} from "./IUploader";
import ILogger from "../logger/ILogger";
import {DateTime} from "luxon";
import axios from "axios";
import catcher, {Oauth2Response} from "./oauth2/catcher";
import fetchAlbumArt from "../applescript/fetchAlbumArt";
import crypto from "crypto";
import {Configuration} from "../config/config.type";

export default class ImgurUploader implements IUploader {
    private readonly _clientId: string;
    private _secret?: Oauth2Response;
    private _enabled: boolean = false;

    private readonly _cache: Cache;
    private readonly _logger: ILogger;

    constructor(cache: Cache, logger: ILogger, config: Configuration) {
        this._cache = cache;
        this._logger = logger;
        this._clientId = config.uploader.imgur.clientId;

        if (config.uploader.enabled) {
            this.init().catch(e => logger.writeError(e.message));
        }
    }

    private async init() {
        const storage = path.join(this._cache.getCacheLocation(), 'imgur.json');
        if (fs.existsSync(storage)) {
            try {
                const file = await fsp.readFile(storage, 'utf-8');
                const json = JSON.parse(file) as Oauth2Response;

                if (json.access_token && json.expires_in > DateTime.now().toJSDate().getTime()) {
                    this._secret = json;
                    this._enabled = true;
                    return;
                }
            } catch (e) {
                // do nothing when fails.
            }
        }

        // Request a session key.
        const oauthUrl = `https://api.imgur.com/oauth2/authorize?client_id=${this._clientId}&response_type=token&state=none`;
        try {
            const result = await catcher(oauthUrl);
            result.expires_in = DateTime.now().plus({ millisecond: result.expires_in }).toJSDate().getTime();
            this._secret = result;

            // Store to cache
            await fsp.writeFile(storage, JSON.stringify(result), 'utf-8');
            this._enabled = true;
        } catch (e) {
            this._enabled = false;
        }
    }

    async uploadArt(albumName: string): Promise<void> {
        if (!this._enabled || !this._secret) return;

        try {
            const image = await fetchAlbumArt();

            const form = new FormData();
            form.append('image', new Blob([image]));

            const result = await axios.post('https://api.imgur.com/3/image', form, {
                headers: {
                    'Authorization': `Bearer ${this._secret.access_token}`
                }
            });

            if (!result.data.success) {
                this._logger.writeError('Failed to upload.');
                return;
            }

            const name = crypto.createHash('sha1')
                .update(albumName, 'utf-8')
                .digest('hex');


            this._cache.addItemToCache(name, result.data.data.link);
        } catch (e: any) {
            this._logger.writeError('Failed to upload.', e.message);
        }
    }
}
