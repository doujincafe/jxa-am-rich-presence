export interface IUploader {
    uploadArt(albumName: string): Promise<void>;
}
