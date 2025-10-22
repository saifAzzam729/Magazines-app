import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { loadEnv } from '../config/env.js';

export async function getTransport() {
  const env = loadEnv();
  const useEthereal = !process.env.SMTP_HOST;
  if (useEthereal) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'bernie90@ethereal.email',
        pass: 'RXwCT65GmPMtvCguWs'
      }
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const env = loadEnv();
  const transporter = await getTransport();
  const info = await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  if (nodemailer.getTestMessageUrl(info)) {
    return { previewUrl: nodemailer.getTestMessageUrl(info) };
  }
  return { messageId: info.messageId };
}

export function renderTemplate(title: string, body: string) {
  return `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif">\n<h2>${title}</h2>\n<p>${body}</p>\n</body></html>`;
}

export function loadEmailTemplate(templateName: string, variables: Record<string, string> = {}): string {
  try {
    const templatePath = join(process.cwd(), 'public', 'email-templates', templateName);
    let template = readFileSync(templatePath, 'utf-8');
    
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return template;
  } catch (err) {
    return renderTemplate('Email Notification', Object.values(variables).join(' '));
  }
}

