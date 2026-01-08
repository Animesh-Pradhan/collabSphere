import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';


@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        try {
            const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
            super({ adapter });
        } catch (e) {
            console.error('DEBUG: PrismaService constructor error', e);
            throw e;
        }
    }

}