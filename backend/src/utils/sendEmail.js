import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let transporter = null;

function getTransporter() {
  if (!env.email.host || !env.email.user) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: { user: env.email.user, pass: env.email.pass },
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    logger.info(`[email:dev] To: ${to}\nSubject: ${subject}\n${text || html}`);
    return { dev: true };
  }
  await t.sendMail({
    from: env.email.from,
    to,
    subject,
    html,
    text,
  });
}
