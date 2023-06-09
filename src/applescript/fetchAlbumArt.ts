import child_process from 'child_process';

export default async function fetchAlbumArt(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const spawn = child_process
            .spawn('osascript', [`-e`, 'tell application "Music" to get raw data of artwork 1 of current track']);

        let data = '';
        spawn.stdout.on('data', d => data += d.toString());
        spawn.on('close', () => {
            if (data.length < 10) {
                return reject(new Error('Invalid received data. Has data but not sufficient'));
            }

            data = data.slice(10).slice(0, -2);

            if (!(/^[a-f0-9]+$/gi.test(data))) {
                return reject(new Error('Invalid received data. Data contains invalid data.'));
            }

            resolve(Buffer.from(data.toLowerCase(), 'hex'));
        });
    });
}
