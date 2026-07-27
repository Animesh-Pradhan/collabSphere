import { MAX_IMAGE_SIZE } from "./upload.constant";

type MulterFileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

export const imageFileFilter = (
    _req: any,
    file: Express.Multer.File,
    cb: MulterFileFilterCallback,
) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
};

export const imageLimits = {
    fileSize: MAX_IMAGE_SIZE,
};
