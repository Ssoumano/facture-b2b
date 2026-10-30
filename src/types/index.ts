export type Currency = 'EUR' | 'USD' | 'CHF' | 'GBP';
export type Language = 'FR' | 'EN';
export type VatStatus = 'franchise' | 'assujetti';
export type ClientType = 'professional' | 'individual';
export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface Emitter {
  name: string;
  address: string;
  siret: string;
  iban: string;
  email: string;
  vatStatus: VatStatus;
  vatNumber?: string;
  invoicePrefix: string;
  invoiceCount: number;
}

export interface Client {
  name: string;
  address: string;
  country: string;
  type: ClientType;
  vatNumber?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // in centimes
}

export interface Invoice {
  id: string;
  number: string;
  dateIssue: string;
  dateDue: string;
  emitter: Emitter;
  client: Client;
  items: InvoiceItem[];
  currency: Currency;
  language: Language;
  status: InvoiceStatus;
  totalHt: number; // in centimes
  totalVat: number; // in centimes
  totalTtc: number; // in centimes
  vatRate: number; // e.g., 20
  legalMention?: string;
}

export interface AppState {
  emitter: Emitter;
  invoices: Invoice[];
  updateEmitter: (emitter: Partial<Emitter>) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getNextInvoiceNumber: () => string;
  incrementInvoiceCount: () => void;
}
