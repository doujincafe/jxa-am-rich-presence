import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface ArtCache {
    [key: string]: string
}

export default class Cache {
    private readonly _albumArtCache: ArtCache = {};
    private readonly _artCacheLocation = path.join(os.homedir(), './.jxa-am-cache');

    constructor() {
        if (!fs.existsSync(this._artCacheLocation)) {
            fs.mkdirSync(this._artCacheLocation);
            return;
        }

        try {
            const cachePath = path.join(this._artCacheLocation, 'cache.json');
            this._albumArtCache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
        } catch (e) {
            this._albumArtCache = {};
        }
    }

    addItemToCache(id: string, resourcePath: string) {
        if (!this._albumArtCache[id]) {
            this._albumArtCache[id] = resourcePath;
        }

        // Save cache to disk
        const cachePath = path.join(this._artCacheLocation, 'cache.json');
        fs.writeFileSync(cachePath, JSON.stringify(this._albumArtCache, undefined, 2), 'utf-8');
    }

    getCache(albumName: string): string | null {
        const id = crypto.createHash('sha1')
            .update(albumName, 'utf-8')
            .digest('hex');

        if (!this._albumArtCache[id]) return null;
        return this._albumArtCache[id];
    }

    getCacheLocation(): string {
        return this._artCacheLocation;
    }
}
