import 'express';
import { GatePayload } from 'src/auth/auth.service';

declare module 'express' {
    interface Request {
        user: GatePayload;
        gateToken?: string;
        // session?: { id: string; userId: string; orgId: string | null; };

        cookies: {
            gateToken?: string;
            vaultToken?: string;
        };
    }
}
