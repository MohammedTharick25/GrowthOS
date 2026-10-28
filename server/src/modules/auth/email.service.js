import { env } from '../../config/env.js';

export function accountLink(path, token) {
  const url = new URL(path, env.CLIENT_ORIGIN);
  url.searchParams.set('token', token);
  return url.toString();
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

function renderGrowthEmail({ eyebrow, title, intro, action, link, footer = 'If you did not request this, you can safely ignore this email.' }) {
  const safe = { eyebrow, title, intro, action, link, footer };
  for (const key of Object.keys(safe)) safe[key] = escapeHtml(safe[key]);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${safe.title}</title></head><body style="margin:0;padding:0;background:#e9eee8;color:#24302a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e9eee8"><tr><td align="center" style="padding:36px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px"><tr><td style="padding:0 0 18px"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td width="38" height="38" align="center" valign="middle" style="border-radius:12px;background:#345d4b;color:#f7f5f0;font-size:20px;font-weight:bold">↗</td><td style="padding-left:10px;color:#24302a;font-size:18px;font-weight:700;letter-spacing:-.5px">growth<span style="color:#345d4b">OS</span></td></tr></table></td></tr><tr><td style="padding:36px 34px 32px;border:1px solid #dce4da;border-radius:22px;background:#f9f8f3"><p style="margin:0 0 12px;color:#537762;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">${safe.eyebrow}</p><h1 style="margin:0 0 14px;color:#24302a;font-size:27px;line-height:1.2;letter-spacing:-.7px">${safe.title}</h1><p style="margin:0 0 26px;color:#58665d;font-size:15px;line-height:1.7">${safe.intro}</p><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="border-radius:999px;background:#345d4b"><a href="${safe.link}" style="display:inline-block;padding:14px 23px;border:1px solid #345d4b;border-radius:999px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none">${safe.action}</a></td></tr></table><p style="margin:24px 0 7px;color:#737f76;font-size:12px;line-height:1.6">If the button does not work, copy and paste this link into your browser:</p><p style="margin:0;overflow-wrap:anywhere;font-size:12px;line-height:1.6"><a href="${safe.link}" style="color:#345d4b">${safe.link}</a></p><hr style="height:1px;margin:27px 0 16px;border:0;background:#e0e5de"><p style="margin:0;color:#7a857c;font-size:12px;line-height:1.6">${safe.footer}</p></td></tr><tr><td align="center" style="padding:20px 12px 0;color:#7a857c;font-size:11px;line-height:1.6">Small steps count. Rest is part of growth.<br>GrowthOS · A daily practice for becoming</td></tr></table></td></tr></table></body></html>`;
}

export async function sendAccountLink({ to, subject, intro, link, action }) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) return false;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [to],
        subject,
        text: `${intro}\n\n${action}: ${link}\n\nIf you did not request this, you can ignore this message.`,
        html: renderGrowthEmail({ eyebrow: 'A NOTE FROM GROWTHOS', title: subject, intro, link, action }),
      }),
    });
    if (!response.ok) throw new Error(`Mail provider returned HTTP ${response.status}.`);
    return true;
  } catch (error) {
    console.error('GrowthOS account email could not be delivered.', error.message);
    return false;
  }
}

export async function sendPracticeReminder({ to, type, link }) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) return false;
  const messages = {
    morning: { subject: 'A small plan for today', intro: 'Take a moment to choose a few actions that fit the day you have.', action: 'Open today’s practice' },
    evening: { subject: 'A gentle end-of-day reflection', intro: 'Notice one thing that went well, one thing you learned, and one way you showed up.', action: 'Write a reflection' },
    weekly: { subject: 'A little time to notice your week', intro: 'Look back at what helped, what felt hard, and what you want to carry forward.', action: 'Review your practice' },
  };
  const message = messages[type];
  if (!message) return false;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [to],
        subject: message.subject,
        text: `${message.intro}\n\n${message.action}: ${link}`,
        html: renderGrowthEmail({ eyebrow: 'YOUR DAILY PRACTICE', title: message.subject, intro: message.intro, link, action: message.action, footer: 'You chose to receive practice reminders. You can change or turn these off in your GrowthOS settings.' }),
      }),
    });
    if (!response.ok) throw new Error(`Mail provider returned HTTP ${response.status}.`);
    return true;
  } catch (error) {
    console.error('GrowthOS reminder email could not be delivered.', error.message);
    return false;
  }
}
