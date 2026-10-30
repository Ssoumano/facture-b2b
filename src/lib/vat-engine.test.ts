import { describe, it, expect } from 'vitest';
import { calculateVat } from './vat-engine';
import { Emitter, Client } from '@/types';

const emitterAssujetti: Emitter = {
  name: 'Test',
  address: '',
  siret: '',
  iban: '',
  email: '',
  vatStatus: 'assujetti',
  vatNumber: 'FR12345678901',
  invoicePrefix: 'FB-',
  invoiceCount: 0,
};

const emitterFranchise: Emitter = {
  ...emitterAssujetti,
  vatStatus: 'franchise',
};

describe('VAT Engine', () => {
  it('Rule 1: Franchise 293 B (FR Client)', () => {
    const client: Client = { name: 'C', address: '', country: 'FR', type: 'professional' };
    const res = calculateVat(emitterFranchise, client);
    expect(res.rate).toBe(0);
    expect(res.mention).toBe('TVA non applicable, art. 293 B du CGI');
  });

  it('Rule 1: Franchise 293 B (EU Client)', () => {
    const client: Client = { name: 'C', address: '', country: 'DE', type: 'professional', vatNumber: 'DE123456789' };
    const res = calculateVat(emitterFranchise, client);
    expect(res.rate).toBe(0);
    expect(res.mention).toBe('TVA non applicable, art. 293 B du CGI');
  });

  it('Rule 2: Assujetti + France Client', () => {
    const client: Client = { name: 'C', address: '', country: 'FR', type: 'professional' };
    const res = calculateVat(emitterAssujetti, client);
    expect(res.rate).toBe(20);
    expect(res.mention).toBeUndefined();
  });

  it('Rule 3: Assujetti + EU Client Pro + Valid VIES', () => {
    const client: Client = { name: 'C', address: '', country: 'DE', type: 'professional', vatNumber: 'DE123456789' };
    const res = calculateVat(emitterAssujetti, client);
    expect(res.rate).toBe(0);
    expect(res.mention).toContain('Autoliquidation');
    expect(res.isViesValid).toBe(true);
  });

  it('Rule 3: Assujetti + EU Client Pro + Invalid/Missing VIES', () => {
    const client: Client = { name: 'C', address: '', country: 'DE', type: 'professional', vatNumber: 'INVALID' };
    const res = calculateVat(emitterAssujetti, client);
    expect(res.rate).toBe(20);
    expect(res.warning).toBeDefined();
    expect(res.isViesValid).toBe(false);
  });

  it('Rule 4: Assujetti + EU Client Individual', () => {
    const client: Client = { name: 'C', address: '', country: 'DE', type: 'individual' };
    const res = calculateVat(emitterAssujetti, client);
    expect(res.rate).toBe(20);
    expect(res.warning).toContain('Cas particulier');
  });

  it('Rule 5: Assujetti + Non-EU Client Pro', () => {
    const client: Client = { name: 'C', address: '', country: 'US', type: 'professional' };
    const res = calculateVat(emitterAssujetti, client);
    expect(res.rate).toBe(0);
    expect(res.mention).toContain('VAT not applicable');
  });
});
