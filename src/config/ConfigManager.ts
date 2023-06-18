import {Configuration} from "./config.type";
import path from "path";
import fs from "fs";
import * as url from "url";

const configDefaults: Configuration = {
    uploader: {
        enabled: false,
        use: 'imgur',
        imgur: {
            clientId: ''
        },
        custom: {
            hostname: '',
            username: '',
            password: ''
        }
    },
    discord: {
        clientId: '944568808276897862',
        assets: {
            large: {
                key: 'main_art',
                text: 'Apple Music on macOS'
            },
            small: {
                playing: {
                    key: 'music_play',
                    text: 'Playing'
                },
                paused: {
                    key: 'music_pause',
                    text: 'Paused'
                },
                stopped: {
                    key: 'music_stop',
                    text: 'Stopped'
                }
            }
        }
    }
}

export default class ConfigManager {
    public readonly Config: Configuration;

    constructor() {
        const configPath = path.join(path.dirname(process.execPath), './config.json');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(configDefaults, undefined, 2));
            this.Config = configDefaults;

            return;
        }

        try {
            const file = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(file);

            this.Config = {
                ...configDefaults,
                ...config
            }
        } catch (e) {
            fs.unlinkSync(configPath);
            this.Config = configDefaults;
        }
    }
}
