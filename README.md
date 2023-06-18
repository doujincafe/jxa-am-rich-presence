# `jxa-apple-music` Discord Rich Presence Client

Apple Music Rich Presence for macOS. Supports Intel and ARM based macs.

## Usage

- Download the latest release [here](https://github.com/doujincafe/jxa-am-rich-presence/releases).
- Run `jxa-apple-music` on your terminal.

If you want to start it on startup or run it as a daemon, You can create a `launchd` daemon.
More information can be found [here](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html).

### Configuration

Upon initial start, A `config.json` file will be created. There you can customise the client
on how you wish. It includes features like album art display and custom discord assets.

To enable image upload, I would recommend you to use [imgur](https://imgur.com) service.
Get your [client id](https://apidocs.imgur.com). While setting up, ensure that the **OAUTH2 CALLBACK** is set to:
`http://localhost:53918/callback` to ensure that the client is able to receive the authentication tokens required for
uploading the asset.

Finally, change these parts to:

```json
{
  "uploader": {
    "enabled": true,
    "use": "imgur",
    "imgur": {
      "clientId": "<YOUR CLIENT ID HERE>"
    }
  }
}
```

Upon the startup of the application, it will open your browser to allow the application to access your data. This
happens because uploading [assets is not anonymized](https://apidocs.imgur.com/#authorization-and-oauth). Feel free to
fork your own changes that allows anonymous asset uploading.

For custom discord application, create your app on discord [here](https://discord.com/developers/applications).
Upload your assets and modify these section:

```json
{
  "discord": {
    "clientId": "<YOUR DISCORD APPLICATION ID>",
    "assets": {
      "large": {
        "key": "<YOUR LARGE IMAGE ASSET KEY NAME>",
        "text": "<CUSTOM DESCRIPTION>"
      },
      "small": {
        "playing": {
          "key": "<YOUR PLAYING IMAGE ASSET KEY NAME>",
          "text": "<CUSTOM DESCRIPTION>"
        },
        "paused": {
          "key": "<YOUR PAUSED IMAGE ASSET KEY NAME>",
          "text": "<CUSTOM DESCRIPTION>"
        },
        "stopped": {
          "key": "<YOUR STOPPED IMAGE ASSET KEY NAME>",
          "text": "<CUSTOM DESCRIPTION>"
        }
      }
    }
  }
}
```

After making changes, save the configuration and restart the application.

## Self Compilation

### Requirements

- [node.js >=18](https://nodejs.org)
- [`pnpm`](https://pnpm.io)
- [Commandline tools for Xcode](https://developer.apple.com/xcode/resources/). (You can install it with
`xcode-select --install`)

### How to build

- `pnpm install`
- `pnpm run build`

## License

This project is licensed under [MIT](LICENSE)
