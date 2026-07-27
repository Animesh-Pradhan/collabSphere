import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateVariables } from './types';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    private async sendMail(to: string, subject: string, html: string): Promise<void> {
        try {
            await this.transporter.sendMail({ from: `"CollabSphere" <${process.env.MAIL_FROM}>`, to, subject, html });
        } catch (err) {
            this.logger.error('Mail send failed', err);
            throw new InternalServerErrorException('Email delivery failed');
        }
    }

    private renderTemplate(templateName: string, variables: TemplateVariables): string {
        const basePath = path.join(process.cwd(), 'src', 'mail', 'templates');
        const baseTemplate = fs.readFileSync(path.join(basePath, 'base.html'), 'utf8');
        let content = fs.readFileSync(path.join(basePath, `${templateName}.html`), 'utf8');

        for (const [key, value] of Object.entries(variables)) {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        return baseTemplate.replace('{{content}}', content).replace('{{year}}', new Date().getFullYear().toString());
    }

    async sendEmailOtp(email: string, otp: string) {
        const html = this.renderTemplate('email-otp', { otp, expiry: '10 minutes' });
        await this.sendMail(email, 'Verify your email', html);
    }

    async sendPasswordChangedAlert(email: string) {
        const html = this.renderTemplate('password-changed', {});
        await this.sendMail(email, 'Your password was changed', html);
    }

    async sendOrganisationInviteEmail(email: string, data: {
        inviteLink: string;
        expiry: string;
        organisationName?: string;
        inviterName?: string;
    }) {
        const html = this.renderTemplate('organisation-invite', {
            inviteLink: data.inviteLink,
            expiry: data.expiry,
            organisationName: data.organisationName ?? 'your organisation',
            inviterName: data.inviterName ?? 'A team member',
        });

        await this.sendMail(email, 'You have been invited to join an organisation', html);
    }
}
