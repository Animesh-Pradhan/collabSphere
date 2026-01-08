import { ConsoleLogger, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {

    private getCurrentLogFile() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        const logDir = path.join(process.cwd(), 'logs');
        const logFile = path.join(logDir, `${yyyy}-${mm}-${dd}.log`);

        return { logDir, logFile };
    }

    private getFormattedEntry(level: string, context: string, message: string) {
        const timestamp = Intl.DateTimeFormat('en-IN', {
            dateStyle: 'short',
            timeStyle: 'medium',
            timeZone: 'Asia/Kolkata'
        }).format(new Date());

        return `${timestamp} [${level}] [${context}] ${message}\n`;
    }

    private async write(entry: string) {
        const { logDir, logFile } = this.getCurrentLogFile();

        try {
            await fs.mkdir(logDir, { recursive: true });
            await fs.appendFile(logFile, entry);
        } catch (error) {
            console.error('LOGGER FILE ERROR:', error);
        }
    }

    log(message: any, context = 'App') {
        const entry = this.getFormattedEntry('LOG', context, message);
        this.write(entry);
        super.log(message, context);
    }

    error(message: any, trace?: string, context = 'App') {
        const entry = this.getFormattedEntry('ERROR', context, `${message} ${trace || ''}`);
        this.write(entry);
        super.error(message, trace, context);
    }

    warn(message: any, context = 'App') {
        const entry = this.getFormattedEntry('WARN', context, message);
        this.write(entry);
        super.warn(message, context);
    }
}
