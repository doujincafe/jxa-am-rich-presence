import http from 'http';
import child_process from "child_process";
import fs from 'fs';
import path from 'path';
import * as qs from 'querystring';

function validateOauthRequest(object: Oauth2Response) {
    return object.access_token && !isNaN(object.expires_in) && object.expires_in > 0 && object.token_type &&
        object.refresh_token;
}

export type Oauth2Response = {
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token: string;
}

export default async function catcher(oauthUrl: string): Promise<Oauth2Response> {
    return new Promise((resolve, reject) => {
        child_process.exec(`open "${oauthUrl}"`);

        const web = fs.readFileSync(path.join(__dirname, './index.html'));
        const srv = http.createServer((req, res) => {
            const url = req.url ?? '';

            // Show callback
            if (url.indexOf('/callback') >= 0) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(web);
                res.end();

                return;
            }

            // Receive tokens
            if (url.indexOf('/api-callback') >= 0) {
                const data = qs.parse(url);
                const response: Oauth2Response = {
                    access_token: data['/api-callback?access_token'] as string,
                    token_type: data['token_type'] as string,
                    refresh_token: data['refresh_token'] as string,
                    expires_in: Number(data['expires_in'] as string),
                }

                if (!validateOauthRequest(response)) {
                    srv.close();
                    return reject(new Error('Invalid response'));
                }

                res.writeHead(200);
                res.write('ok');
                res.end();

                resolve(response);
                srv.close();
            }
        });

        srv.listen(53918);
    })
}
