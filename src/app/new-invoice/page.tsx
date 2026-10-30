'use client';

import React, { useState, useEffect } from 'react';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { calculateVat, EU_COUNTRIES, formatAmount } from '@/lib/vat-engine';
import { Client, Currency, Invoice, InvoiceItem, Language } from '@/types';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'BE', name: 'Belgique' },
  { code: 'ES', name: 'Espagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'US', name: 'États-Unis' },
  { code: 'CH', name: 'Suisse' },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const { emitter, addInvoice, getNextInvoiceNumber, incrementInvoiceCount } = useInvoiceStore();

  const [client, setClient] = useState<Client>({
    name: '',
    address: '',
    country: 'FR',
    type: 'professional',
    vatNumber: '',
  });

  const [currency, setCurrency] = useState<Currency>('EUR');
  const [language, setLanguage] = useState<Language>('FR');
  
  const [dateIssue, setDateIssue] = useState('');
  const [dateDue, setDateDue] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const dueDateDefault = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateIssue(today);
    setDateDue(dueDateDefault);
  }, []);

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Prestation de services', quantity: 1, unitPrice: 100000 },
  ]);

  // Calculations
  const vatResult = calculateVat(emitter, client);

  const addItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const totalHt = items.reduce((sum, item) => sum + item.quantity * Math.round(item.unitPrice), 0);
  const totalVat = Math.round((totalHt * vatResult.rate) / 100);
  const totalTtc = totalHt + totalVat;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceNumber = getNextInvoiceNumber();

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      number: invoiceNumber,
      dateIssue,
      dateDue,
      emitter,
      client,
      items,
      currency,
      language,
      status: 'pending',
      totalHt,
      totalVat,
      totalTtc,
      vatRate: vatResult.rate,
      legalMention: vatResult.mention,
    };

    addInvoice(newInvoice);
    incrementInvoiceCount();
    router.push(`/invoice/${newInvoice.id}`);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Nouvelle Facture</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Générez une facture conforme avec calcul automatique de la TVA et des mentions légales.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Settings Bar */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Devise</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="CHF">CHF (CHF)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Langue de la facture</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="FR">Français (FR)</option>
              <option value="EN">English (EN)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Date d'émission</label>
              <input
                type="date"
                value={dateIssue}
                onChange={(e) => setDateIssue(e.target.value)}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Échéance</label>
              <input
                type="date"
                value={dateDue}
                onChange={(e) => setDateDue(e.target.value)}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>
          </div>
        </div>

        {/* Client Section */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
          <h2 className="text-base font-medium text-zinc-900 border-b border-zinc-200 pb-3">Informations Client</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Nom du client / Entreprise</label>
              <input
                type="text"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
                placeholder="Acme Corp"
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Pays</label>
              <select
                value={client.country}
                onChange={(e) => setClient({ ...client, country: e.target.value })}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Adresse complète</label>
            <textarea
              value={client.address}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
              rows={2}
              placeholder="10 Main Street, Berlin, Germany"
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Type de client</label>
              <select
                value={client.type}
                onChange={(e) => setClient({ ...client, type: e.target.value as any })}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="professional">Professionnel (B2B)</option>
                <option value="individual">Particulier (B2C)</option>
              </select>
            </div>

            {client.type === 'professional' && client.country !== 'FR' && EU_COUNTRIES.includes(client.country) && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">N° de TVA Intracommunautaire</label>
                <input
                  type="text"
                  value={client.vatNumber || ''}
                  onChange={(e) => setClient({ ...client, vatNumber: e.target.value })}
                  placeholder="DE123456789"
                  className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            )}
          </div>
        </div>

        {/* VAT Real-Time Feedback */}
        <div className={cn(
          "p-4 rounded-lg border text-sm space-y-1",
          vatResult.warning ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-zinc-50 border-zinc-200 text-zinc-900"
        )}>
          <div className="flex items-center gap-2 font-medium">
            {vatResult.warning ? <AlertTriangle size={16} className="text-amber-600" /> : <CheckCircle size={16} className="text-emerald-600" />}
            <span>Règle TVA appliquée : Taux à {vatResult.rate}%</span>
          </div>
          {vatResult.mention && <p className="text-xs opacity-80">Mention légale : {vatResult.mention}</p>}
          {vatResult.warning && <p className="text-xs text-amber-700 font-medium">Alerte : {vatResult.warning}</p>}
        </div>

        {/* Items Section */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h2 className="text-base font-medium text-zinc-900">Prestations</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-3 py-1.5 rounded-md transition-colors"
            >
              <Plus size={14} />
              Ajouter une ligne
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Description de la prestation"
                  className="flex-1 border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  required
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                  placeholder="Qté"
                  min="1"
                  className="w-20 border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  required
                />
                <input
                  type="number"
                  value={item.unitPrice / 100}
                  onChange={(e) => updateItem(item.id, 'unitPrice', Math.round(parseFloat(e.target.value || '0') * 100))}
                  placeholder="Prix unit. (€)"
                  step="0.01"
                  min="0"
                  className="w-32 border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="p-2 text-zinc-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Totals Preview */}
          <div className="border-t border-zinc-200 pt-4 flex flex-col items-end space-y-1 text-sm">
            <div className="flex justify-between w-64">
              <span className="text-zinc-500">Total HT :</span>
              <span className="font-medium text-zinc-900">{formatAmount(totalHt, currency, language)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-zinc-500">TVA ({vatResult.rate}%) :</span>
              <span className="font-medium text-zinc-900">{formatAmount(totalVat, currency, language)}</span>
            </div>
            <div className="flex justify-between w-64 border-t border-zinc-200 pt-2 text-base font-semibold">
              <span className="text-zinc-900">Total TTC :</span>
              <span className="text-zinc-900">{formatAmount(totalTtc, currency, language)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <FileText size={16} />
            Créer et voir la facture
          </button>
        </div>
      </form>
    </div>
  );
}
