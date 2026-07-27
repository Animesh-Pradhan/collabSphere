import { StorageProvider } from "generated/prisma/enums";

export interface UploadResult {
    fileKey: string;
    storageProvider: StorageProvider;
}

export abstract class StorageAdapter {
    abstract upload(file: Express.Multer.File, folder: string): Promise<UploadResult>;
    abstract delete(fileKey: string): Promise<void>;
    abstract getUrl(fileKey: string): Promise<string>;
}