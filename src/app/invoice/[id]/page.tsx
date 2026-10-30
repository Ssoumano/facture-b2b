'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { formatAmount } from '@/lib/vat-engine';
import { InvoicePDF } from '@/components/InvoicePDF';
import { Download, ArrowLeft } from 'lucide-react';
import dynamicImport from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Language } from '@/types';

const PDFDownloadLink = dynamicImport(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const LABELS: Record<Language, Record<string, string>> = {
  FR: {
    docTitle: 'FACTURE',
    issued: 'Émise le',
    due: 'Échéance',
    billedTo: 'Facturé à',
    country: 'Pays',
    type: 'Type',
    vatNumber: 'N° TVA',
    description: 'Description',
    qty: 'Qté',
    unitPrice: 'Prix Unit.',
    lineTotal: 'Total HT',
    totalHt: 'Total HT',
    totalVat: 'TVA',
    totalTtc: 'Total TTC',
    legalTitle: 'Mention légale TVA',
    pending: 'En attente',
    paid: 'Payée',
    overdue: 'En retard',
    back: 'Retour',
    download: 'Télécharger PDF',
    generating: 'Génération...',
    notFound: 'Facture introuvable',
    backToDashboard: 'Retour au Dashboard',
    footer:
      "Pénalités de retard : 3 fois le taux d'intérêt légal. Indemnité forfaitaire pour frais de recouvrement : 40 €. Pas d'escompte pour paiement anticipé.",
    footerEn:
      'Late payment penalties: 3 times the legal interest rate. Fixed compensation for recovery costs: 40 €. No discount for early payment.',
    clientTypeProfessional: 'Professionnel',
    clientTypeIndividual: 'Particulier',
  },
  EN: {
    docTitle: 'INVOICE',
    issued: 'Issued on',
    due: 'Due date',
    billedTo: 'Billed to',
    country: 'Country',
    type: 'Type',
    vatNumber: 'VAT no.',
    description: 'Description',
    qty: 'Qty',
    unitPrice: 'Unit price',
    lineTotal: 'Amount excl. VAT',
    totalHt: 'Total excl. VAT',
    totalVat: 'VAT',
    totalTtc: 'Total incl. VAT',
    legalTitle: 'VAT legal mention',
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    back: 'Back',
    download: 'Download PDF',
    generating: 'Generating...',
    notFound: 'Invoice not found',
    backToDashboard: 'Back to Dashboard',
    footer:
      "Pénalités de retard : 3 fois le taux d'intérêt légal. Indemnité forfaitaire pour frais de recouvrement : 40 €. Pas d'escompte pour paiement anticipé.",
    footerEn:
      'Late payment penalties: 3 times the legal interest rate. Fixed compensation for recovery costs: 40 €. No discount for early payment.',
    clientTypeProfessional: 'Business',
    clientTypeIndividual: 'Individual',
  },
};

function InvoiceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { invoices, updateInvoice } = useInvoiceStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const invoice = invoices.find((inv) => inv.id === params.id);

  if (!invoice) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h1 className="text-xl font-semibold text-zinc-900">Facture introuvable / Invoice not found</h1>
        <button
          onClick={() => router.push('/')}
          className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Retour au Dashboard / Back to Dashboard
        </button>
      </div>
    );
  }

  const t = LABELS[invoice.language] ?? LABELS.FR;
  const clientTypeLabel =
    invoice.client.type === 'professional' ? t.clientTypeProfessional : t.clientTypeIndividual;

  const handleStatusChange = (status: 'paid' | 'pending' | 'overdue') => {
    updateInvoice(invoice.id, { status });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={16} />
          {t.back}
        </button>

        <div className="flex items-center gap-4">
          {/* Status selector */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
            <button
              onClick={() => handleStatusChange('pending')}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                invoice.status === 'pending'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              {t.pending}
            </button>
            <button
              onClick={() => handleStatusChange('paid')}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                invoice.status === 'paid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              {t.paid}
            </button>
            <button
              onClick={() => handleStatusChange('overdue')}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                invoice.status === 'overdue'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              {t.overdue}
            </button>
          </div>

          {/* Download PDF */}
          {isClient && (
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} />}
              fileName={`${invoice.number}.pdf`}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              {({ loading }) => (
                <>
                  <Download size={16} />
                  {loading ? t.generating : t.download}
                </>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Invoice Preview Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-zinc-200 pb-8">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{invoice.emitter.name}</h1>
            <p className="text-sm text-zinc-500 whitespace-pre-line mt-1">{invoice.emitter.address}</p>
            <p className="text-xs text-zinc-500 mt-2">SIRET : {invoice.emitter.siret}</p>
            <p className="text-xs text-zinc-500">Email : {invoice.emitter.email}</p>
            {invoice.emitter.vatNumber && (
              <p className="text-xs text-zinc-500">
                {t.vatNumber} : {invoice.emitter.vatNumber}
              </p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{t.docTitle}</h2>
            <p className="text-sm font-semibold text-zinc-700 mt-1">{invoice.number}</p>
            <p className="text-xs text-zinc-500 mt-2">
              {t.issued} : {invoice.dateIssue}
            </p>
            <p className="text-xs text-zinc-500">
              {t.due} : {invoice.dateDue}
            </p>
          </div>
        </div>

        {/* Client */}
        <div className="bg-zinc-50/50 border border-zinc-100 rounded-lg p-6">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            {t.billedTo}
          </h3>
          <p className="font-semibold text-zinc-900">{invoice.client.name}</p>
          <p className="text-sm text-zinc-600 whitespace-pre-line">{invoice.client.address}</p>
          <p className="text-xs text-zinc-500 mt-1">
            {t.country} : {invoice.client.country} • {t.type} : {clientTypeLabel}
          </p>
          {invoice.client.vatNumber && (
            <p className="text-xs text-zinc-500">
              {t.vatNumber} : {invoice.client.vatNumber}
            </p>
          )}
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">{t.description}</th>
                <th className="py-3 px-4 text-center">{t.qty}</th>
                <th className="py-3 px-4 text-right">{t.unitPrice}</th>
                <th className="py-3 px-4 text-right">{t.lineTotal}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 px-4 text-zinc-900">{item.description}</td>
                  <td className="py-4 px-4 text-center text-zinc-600">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-zinc-600">
                    {formatAmount(item.unitPrice, invoice.currency, invoice.language)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-zinc-900">
                    {formatAmount(item.quantity * item.unitPrice, invoice.currency, invoice.language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end pt-4 border-t border-zinc-200">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">{t.totalHt}</span>
              <span className="font-medium text-zinc-900">
                {formatAmount(invoice.totalHt, invoice.currency, invoice.language)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">
                {t.totalVat} ({invoice.vatRate}%)
              </span>
              <span className="font-medium text-zinc-900">
                {formatAmount(invoice.totalVat, invoice.currency, invoice.language)}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
              <span className="text-zinc-900">{t.totalTtc}</span>
              <span className="text-zinc-900">
                {formatAmount(invoice.totalTtc, invoice.currency, invoice.language)}
              </span>
            </div>
          </div>
        </div>

        {/* Legal Mention */}
        {invoice.legalMention && (
          <div className="bg-zinc-50 border-l-2 border-zinc-900 p-4 rounded-r-lg text-xs text-zinc-700">
            <span className="font-semibold block mb-1">{t.legalTitle} :</span>
            {invoice.legalMention}
          </div>
        )}

        {/* Footer info */}
        <div className="border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 space-y-1">
          <p>{t.footer}</p>
          {invoice.language === 'EN' && <p>{t.footerEn}</p>}
          <p>
            IBAN : {invoice.emitter.iban} — SIRET : {invoice.emitter.siret}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  return (
    <Suspense fallback={<div className="p-8">Chargement de la facture...</div>}>
      <InvoiceDetailContent />
    </Suspense>
  );
}
