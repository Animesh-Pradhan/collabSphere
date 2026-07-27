import { Request } from 'express';
import * as crypto from 'crypto';

type CookieMap = {
    gateToken?: string;
};

export function gateTokenExtractor(req: Request): string | null {
    if (!req) return null;

    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    const cookies = req.cookies as CookieMap | undefined;
    if (typeof cookies?.gateToken === 'string') {
        return cookies.gateToken;
    }

    return null;
}


export function generateOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

export function hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOtp(otp: string, hash: string): boolean {
    return hashOtp(otp) === hash;
}

export const generateFileName = (originalName: string) => {
    const ext = originalName.split(".").pop();
    return `${crypto.randomUUID()}.${ext}`;
};
