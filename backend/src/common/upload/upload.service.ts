import { Injectable } from "@nestjs/common";
import { UPLOAD_PATHS } from "./upload.constant";

@Injectable()
export class UploadService {
    getPublicPath(folder: keyof typeof UPLOAD_PATHS, filename: string) {
        return `/${UPLOAD_PATHS[folder]}/${filename}`;
    }

    resolveFilePath(folder: keyof typeof UPLOAD_PATHS, file?: Express.Multer.File): string | null {
        if (!file) return null;
        return this.getPublicPath(folder, file.filename as string);
    }

    resolveUpdateFilePath(folder: keyof typeof UPLOAD_PATHS, file?: Express.Multer.File): string | undefined {
        if (!file) return undefined;
        return this.getPublicPath(folder, file.filename as string);
    }

}
