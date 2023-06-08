import "@jxa/global-type";
import {run} from "@jxa/run";
import {DateTime} from "luxon";
import ConsoleLogger from "./logger/ConsoleLogger";
import DiscordRichPresence, {RichPresenceContents} from "./DiscordRichPresence";

const RICH_PRESENCE_ID = '944568808276897862';
const LARGE_IMAGE_KEY = 'main_art';
const LARGE_IMAGE_TEXT = 'Apple Music on macOS';
const PLAYING_ART = 'music_play';
const PAUSED_ART = 'music_pause';
const STOPPED_ART = 'music_stop';

const logger = new ConsoleLogger();
const richPresence = new DiscordRichPresence(RICH_PRESENCE_ID, logger);

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
                const music = Application('Music');

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
                    largeImageKey: LARGE_IMAGE_KEY,
                    largeImageText: LARGE_IMAGE_TEXT,
                    smallImageKey: STOPPED_ART,
                    smallImageText: 'Stopped',
                    instance: false
                });

                continue;
            }

            const playback = app as MusicStatus;
            const state: RichPresenceContents = {
                details: playback.album,
                state: `${playback.artist} - ${playback.title}`,
                largeImageKey: LARGE_IMAGE_KEY,
                largeImageText: LARGE_IMAGE_TEXT,
                smallImageKey: playback.playbackStatus === 'playing' ? PLAYING_ART : PAUSED_ART,
                smallImageText: playback.playbackStatus === 'playing' ? PLAYING_ART : PAUSED_ART,
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
