// src/storage/storage.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { StorageAdapter, UploadResult } from "./storage.adapter";
import { LocalStorageService } from "./providers/local-storage.service";
import { StorageProvider } from "generated/prisma/enums";

@Injectable()

export class StorageService {
    constructor(
        private readonly configService: ConfigService,
        private readonly localStorageService: LocalStorageService,
        // private readonly r2StorageService: R2StorageService,
    ) { }

    private get defaultProvider(): StorageProvider {
        const provider = this.configService.get<StorageProvider>("STORAGE_PROVIDER");
        return provider ?? StorageProvider.LOCAL;
    }

    private resolveProvider(provider: StorageProvider): StorageAdapter {
        switch (provider) {
            case StorageProvider.LOCAL:
                return this.localStorageService;
            // case StorageProvider.R2:
            //     return this.r2StorageService;

            default:
                throw new Error(`Unsupported storage provider: ${provider}`);
        }
    }

    async upload(file: Express.Multer.File, folder: string): Promise<UploadResult> {
        return this.resolveProvider(this.defaultProvider).upload(file, folder);
    }

    async delete(fileKey: string, storageProvider: StorageProvider): Promise<void> {
        return this.resolveProvider(storageProvider).delete(fileKey);
    }

    async getUrl(fileKey: string, storageProvider: StorageProvider): Promise<string> {
        return this.resolveProvider(storageProvider).getUrl(fileKey);
    }

}