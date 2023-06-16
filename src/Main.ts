import "@jxa/global-type";
import {run} from "@jxa/run";
import {DateTime} from "luxon";
import Cache from "./Cache";
import ConsoleLogger from "./logger/ConsoleLogger";
import DiscordRichPresence, {RichPresenceContents} from "./DiscordRichPresence";
import Uploader from "./uploaders/Uploader";
import {Application as InternalApplicationType} from "@jxa/types";
import config from '../config';
import ImgurUploader from "./uploaders/ImgurUploader";
import {IUploader} from "./uploaders/IUploader";

const cache = new Cache();
const logger = new ConsoleLogger();
const richPresence = new DiscordRichPresence(config.clientId, logger);
const uploader: IUploader = config.uploader.use === 'imgur'
    ? new ImgurUploader(cache, logger)
    : new Uploader(cache, logger);

let started = false;

async function wait(flag: boolean): Promise<boolean> {
    return new Promise((resolve) => {
        setTimeout(function () {
            resolve(true);
        }, flag ? 15000 : 10);
    });
}

type StatusOnly = {
    playbackStatus: string;
}

type MusicStatus = {
    playbackStatus: string;
    album: string;
    artist: string;
    title: string;
    duration: number;
    elapsed: number;
}

async function runPresence() {
    while (true) {
        const flag = await wait(started);
        if (!started && flag) started = true;

        try {
            const app = await run((): MusicStatus | StatusOnly => {
                const music = Application('Music') as unknown as InternalApplicationType._iTunes;

                // When player is stopped, do not continue.
                if (music.playerState() === 'stopped') return { playbackStatus: 'stopped' };

                const properties = music.currentTrack().properties();
                return {
                    playbackStatus: music.playerState(),
                    album: properties.album,
                    artist: properties.artist,
                    title: properties.name,
                    duration: properties.duration,
                    elapsed: music.playerPosition()
                }
            });

            if ((app as StatusOnly).playbackStatus === 'stopped') {
                richPresence.applyState({
                    state: 'Idle',
                    details: 'Player at idle state.',
                    largeImageKey: config.clientLargeImageDefault,
                    largeImageText: config.clientLargeImageText,
                    smallImageKey: config.playbackAssets.stopped,
                    smallImageText: 'Stopped',
                    instance: false
                });

                continue;
            }

            const playback = app as MusicStatus;

            const resource = cache.getCache(playback.album);
            if (!resource && config.uploader.enabled) {
                uploader.uploadArt(playback.album)
                    .catch(e => logger.writeWarning('Failed to upload art.', e.message));
            }

            const state: RichPresenceContents = {
                details: playback.album,
                state: `${playback.artist} - ${playback.title}`,
                largeImageKey: resource ?? config.clientLargeImageDefault,
                largeImageText: playback.album,
                smallImageKey: playback.playbackStatus === 'playing' ? config.playbackAssets.playing : config.playbackAssets.paused,
                smallImageText: playback.playbackStatus === 'playing' ? 'Playing' : 'Paused',
                instance: false
            };

            if (playback.playbackStatus === 'playing') {
                state.startTimestamp = DateTime.now()
                    .minus({ second: playback.elapsed })
                    .toJSDate();
            }

            richPresence.applyState(state);
        } catch (e: any) {
            logger.writeWarning('Waiting until Music app starts...', e.message);
        }
    }
}

runPresence().catch(logger.writeError);
