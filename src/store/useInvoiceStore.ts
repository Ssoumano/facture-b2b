import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Emitter, Invoice, InvoiceStatus } from '@/types';

const MOCK_EMITTER: Emitter = {
  name: 'Jean Dev',
  address: '123 Rue du Code, 75001 Paris, France',
  siret: '123 456 789 00012',
  iban: 'FR76 3000 6000 0112 3456 7890 123',
  email: 'jean@dev.fr',
  vatStatus: 'franchise',
  invoicePrefix: 'FB-2026-',
  invoiceCount: 4,
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    number: 'FB-2026-0001',
    dateIssue: '2026-10-01',
    dateDue: '2026-10-31',
    emitter: MOCK_EMITTER,
    client: {
      name: 'Client A (Paris)',
      address: '45 Ave Tech, 75008 Paris, France',
      country: 'FR',
      type: 'professional',
    },
    items: [{ id: 'i1', description: 'Développement Web', quantity: 1, unitPrice: 500000 }],
    currency: 'EUR',
    language: 'FR',
    status: 'paid',
    totalHt: 500000,
    totalVat: 0,
    totalTtc: 500000,
    vatRate: 0,
    legalMention: 'TVA non applicable, art. 293 B du CGI',
  },
  {
    id: '2',
    number: 'FB-2026-0002',
    dateIssue: '2026-10-10',
    dateDue: '2026-11-09',
    emitter: MOCK_EMITTER,
    client: {
      name: 'Global Corp (Berlin)',
      address: 'Hauptstraße 10, Berlin, Germany',
      country: 'DE',
      type: 'professional',
      vatNumber: 'DE123456789',
    },
    items: [{ id: 'i2', description: 'Consulting React', quantity: 2, unitPrice: 80000 }],
    currency: 'EUR',
    language: 'EN',
    status: 'pending',
    totalHt: 160000,
    totalVat: 0,
    totalTtc: 160000,
    vatRate: 0,
    legalMention: 'TVA non applicable, art. 293 B du CGI',
  },
  {
    id: '3',
    number: 'FB-2026-0003',
    dateIssue: '2026-09-15',
    dateDue: '2026-10-15',
    emitter: MOCK_EMITTER,
    client: {
      name: 'London Tech',
      address: 'Baker Street, London, UK',
      country: 'GB',
      type: 'professional',
    },
    items: [{ id: 'i3', description: 'Audit Sécurité', quantity: 1, unitPrice: 120000 }],
    currency: 'GBP',
    language: 'EN',
    status: 'overdue',
    totalHt: 120000,
    totalVat: 0,
    totalTtc: 120000,
    vatRate: 0,
    legalMention: 'TVA non applicable, art. 293 B du CGI',
  },
  {
    id: '4',
    number: 'FB-2026-0004',
    dateIssue: '2026-10-20',
    dateDue: '2026-11-19',
    emitter: MOCK_EMITTER,
    client: {
      name: 'Alice Individual',
      address: '78 Rue de la Paix, 75002 Paris, France',
      country: 'FR',
      type: 'individual',
    },
    items: [{ id: 'i4', description: 'Coaching JS', quantity: 3, unitPrice: 15000 }],
    currency: 'EUR',
    language: 'FR',
    status: 'pending',
    totalHt: 45000,
    totalVat: 0,
    totalTtc: 45000,
    vatRate: 0,
    legalMention: 'TVA non applicable, art. 293 B du CGI',
  },
];

export const useInvoiceStore = create<AppState>()(
  persist(
    (set, get) => ({
      emitter: MOCK_EMITTER,
      invoices: MOCK_INVOICES,

      updateEmitter: (updatedEmitter) =>
        set((state) => ({
          emitter: { ...state.emitter, ...updatedEmitter },
        })),

      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [invoice, ...state.invoices],
        })),

      updateInvoice: (id, updatedInvoice) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updatedInvoice } : inv
          ),
        })),

      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),

      getNextInvoiceNumber: () => {
        const { emitter } = get();
        const nextCount = emitter.invoiceCount + 1;
        return `${emitter.invoicePrefix}${String(nextCount).padStart(4, '0')}`;
      },

      incrementInvoiceCount: () =>
        set((state) => ({
          emitter: { ...state.emitter, invoiceCount: state.emitter.invoiceCount + 1 },
        })),
    }),
    {
      name: 'facture-b2b-storage',
    }
  )
);
