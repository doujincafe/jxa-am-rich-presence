export type AssetType = {
    key: string;
    text: string;
}

export type Configuration = {
    uploader: {
        enabled: boolean,
        use: 'imgur' | 'custom',
        imgur: {
            clientId: string
        },
        custom: {
            hostname: string,
            username: string,
            password: string
        }
    },
    discord: {
        clientId: string,
        assets: {
            large: AssetType,
            small: {
                playing: AssetType,
                paused: AssetType,
                stopped: AssetType
            }
        }
    }
}
