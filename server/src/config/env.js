import 'dotenv/config';
export const env = {
  PORT: Number(process.env.PORT || 4000), NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/growthos',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-change-me',
  ACCESS_TOKEN_MINUTES: Number(process.env.ACCESS_TOKEN_MINUTES || 15),
  REFRESH_TOKEN_DAYS: Number(process.env.REFRESH_TOKEN_DAYS || 30),
  // Render frontend and API services use separate onrender.com sites, so
  // production auth cookies must be cross-site and secure.
  COOKIE_SECURE: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
  COOKIE_SAME_SITE: process.env.NODE_ENV === 'production' ? 'none' : (process.env.COOKIE_SAME_SITE || 'lax'),
  RESEND_API_KEY: process.env.RESEND_API_KEY || '', MAIL_FROM: process.env.MAIL_FROM || '',
};
if (env.NODE_ENV === 'production' && (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || env.JWT_ACCESS_SECRET.length < 32 || env.JWT_REFRESH_SECRET.length < 32 || env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET)) {
  throw new Error('Set two distinct JWT secrets, each at least 32 characters, in production.');
}
if (env.NODE_ENV === 'production' && (!env.RESEND_API_KEY || !env.MAIL_FROM)) {
  throw new Error('Configure RESEND_API_KEY and MAIL_FROM before starting in production.');
}
