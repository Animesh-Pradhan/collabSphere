import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { UPLOAD_PATHS } from "./upload.constant";
import { imageFileFilter, imageLimits } from "./upload.validators";
import { generateFileName } from "src/utils/helper";

export const UploadInterceptor = (pathKey: keyof typeof UPLOAD_PATHS) =>
    FileInterceptor("file", {
        storage: diskStorage({
            destination: UPLOAD_PATHS[pathKey],
            filename: (_req, file, cb) => {
                cb(null, generateFileName(file.originalname));
            },
        }),
        fileFilter: imageFileFilter,
        limits: imageLimits,
    });
