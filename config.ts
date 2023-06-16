const config = {
    uploader: {
        enabled: false,
        // Recommended. Use "custom" as value and configure properties under "custom" on your self-hosted
        // server.
        use: 'imgur',
        imgur: {
            clientId: '',
        },
        custom: {
            serverHostname: '',
            serverUsername: '',
            serverPassword: '',
        }
    },
    clientId: '',
    clientLargeImageDefault: '',
    clientLargeImageText: '',
    playbackAssets: {
        playing: '',
        paused: '',
        stopped: ''
    },
    button: {
        enabled: false,
        button1_config: {
            text: '',
            urlPlaceholder: ''
        },
        button2_config: {
            text: '',
            url: ''
        }
    }
}

export default config;
