import { Client, Emitter, Language } from '@/types';

export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
];

export interface VatResult {
  rate: number;
  mention?: string;
  warning?: string;
  isViesValid?: boolean;
}

export function validateVies(vatNumber: string | undefined, countryCode: string): boolean {
  if (!vatNumber) return false;
  const cleanVat = vatNumber.replace(/\s+/g, '').toUpperCase();
  // Simple simulation: starts with country code + 8 to 12 chars
  const regex = new RegExp(`^${countryCode}[A-Z0-9]{8,12}$`);
  return regex.test(cleanVat);
}

export function calculateVat(emitter: Emitter, client: Client): VatResult {
  // Rule 1: Emitter in franchise
  if (emitter.vatStatus === 'franchise') {
    return {
      rate: 0,
      mention: 'TVA non applicable, art. 293 B du CGI',
    };
  }

  // Rule 2: Client France
  if (client.country === 'FR') {
    return { rate: 20 };
  }

  const isEu = EU_COUNTRIES.includes(client.country);

  // Rule 3 & 4: EU Client
  if (isEu) {
    if (client.type === 'professional') {
      const isViesValid = validateVies(client.vatNumber, client.country);
      if (isViesValid) {
        return {
          rate: 0,
          mention: 'Autoliquidation – art. 259-1 du CGI / Reverse charge – art. 196 Directive 2006/112/CE',
          isViesValid: true,
        };
      } else {
        return {
          rate: 20,
          warning: 'N° TVA absent ou invalide : application du taux français par défaut.',
          isViesValid: false,
        };
      }
    } else {
      // Rule 4: Client UE Particulier
      return {
        rate: 20,
        warning: 'Cas particulier hors périmètre MVP (Vente à un particulier UE).',
      };
    }
  }

  // Rule 5: Client hors UE
  if (client.type === 'professional') {
    return {
      rate: 0,
      mention: 'TVA non applicable – art. 259-1 du CGI / VAT not applicable',
    };
  }

  // Default for Non-EU Individuals (considered export usually but following minimal rules)
  return { rate: 20 };
}

export function formatAmount(amountInCentimes: number, currency: string = 'EUR', language: Language = 'FR') {
  const locale = language === 'FR' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amountInCentimes / 100);
}
