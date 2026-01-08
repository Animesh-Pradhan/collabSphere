import 'express';

declare module 'express' {
    interface Request {
        cookies: {
            gateToken?: string;
            vaultToken?: string;
        };
    }
}
