import { Injectable } from '@nestjs/common';
import { StorageProvider } from 'generated/prisma/enums';
import { StorageAdapter, UploadResult } from '../storage.adapter';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStorageService extends StorageAdapter {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    private get uploadRoot() {
        return path.join(process.cwd(), this.configService.get<string>("UPLOAD_PATH") ?? "uploads");
    }

    private get appUrl() {
        return this.configService.get<string>("APP_URL") ?? "http://localhost:3000";
    }

    async upload(file: Express.Multer.File, folder: string): Promise<UploadResult> {
        const directory = path.join(this.uploadRoot, folder);
        await fs.mkdir(directory, { recursive: true });

        const fileName = `${randomUUID()}-${file.originalname.replace(/\s+/g, "_")}`;
        const fileKey = path.join(folder, fileName).replace(/\\/g, "/");
        await fs.writeFile(path.join(this.uploadRoot, fileKey), file.buffer);

        return { fileKey, storageProvider: StorageProvider.LOCAL };
    }

    async delete(fileKey: string): Promise<void> {
        const filePath = path.join(this.uploadRoot, fileKey);
        try {
            await fs.unlink(filePath);
        } catch (err: any) {
            if (err.code !== 'ENOENT') throw err;
        }
    }

    async getUrl(fileKey: string): Promise<string> {
        return Promise.resolve(`${this.appUrl}/uploads/${fileKey}`);
    }
}