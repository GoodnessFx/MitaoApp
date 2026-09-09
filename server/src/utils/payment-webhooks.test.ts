import { describe, expect, it } from 'vitest';
import { verifyFlutterwaveSignature, verifyPaystackSignature } from './payment-webhooks';

describe('payment webhook verification', () => {
  it('verifies a valid Paystack signature', () => {
    const raw = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_123' } });
    const secret = 'paystack_secret';
    const signature = 'sha512=' + require('crypto').createHmac('sha512', secret).update(raw).digest('hex');

    expect(verifyPaystackSignature(Buffer.from(raw), secret, signature)).toBe(true);
  });

  it('verifies a valid Flutterwave signature', () => {
    const raw = JSON.stringify({ event: 'charge.completed', data: { tx_ref: 'ref_123' } });
    const secretHash = 'flutterwave_hash';
    const signature = require('crypto').createHash('sha256').update(`${secretHash}${raw}`).digest('hex');

    expect(verifyFlutterwaveSignature(Buffer.from(raw), secretHash, signature)).toBe(true);
  });
});
