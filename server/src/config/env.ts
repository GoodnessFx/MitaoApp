import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  
  DATABASE_URL: z.string().url(),
  
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  ADMIN_JWT_ACCESS_SECRET: z.string().min(1),
  ADMIN_JWT_REFRESH_SECRET: z.string().min(1),
  ADMIN_JWT_ACCESS_EXPIRY: z.string().default('10m'),
  ADMIN_JWT_REFRESH_EXPIRY: z.string().default('2h'),
  
  ENCRYPTION_KEY: z.string().length(64, 'Encryption key must be a 64-character hex string (32 bytes)'),
  
  FRONTEND_URL: z.string().url().default('http://localhost:8443'),
  
  // Optional for dev/startup
  EXCHANGE_RATE_API_URL: z.string().url().optional(),
  EXCHANGE_RATE_API_KEY: z.string().optional(),
  
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  TERMII_API_KEY: z.string().optional(),
  TERMII_SENDER_ID: z.string().optional(),
  
  FCM_SERVER_KEY: z.string().optional(),
  
  SENTRY_DSN: z.string().url().optional(),
  
  DSFULFILL_API_BASE_URL: z.string().url().optional(),
  DSFULFILL_API_KEY: z.string().optional(),
  DSFULFILL_API_SECRET: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:\n', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
