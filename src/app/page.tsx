'use client';

import React, { useEffect, useState } from 'react';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { formatAmount } from '@/lib/vat-engine';
import { Plus, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Currency } from '@/types';

export default function DashboardPage() {
  const { invoices, emitter } = useInvoiceStore();

  // Current month is resolved after mount so the component stays prerender-safe.
  const [monthKey, setMonthKey] = useState('');

  useEffect(() => {
    const now = new Date();
    setMonthKey(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  }, []);

  const paidThisMonth = invoices.filter(
    (inv) => inv.status === 'paid' && (!monthKey || inv.dateIssue.startsWith(monthKey))
  );

  // Never sum different currencies together: group the collected amounts per currency.
  const collectedByCurrency = paidThisMonth.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.currency] = (acc[inv.currency] ?? 0) + inv.totalTtc;
    return acc;
  }, {});

  const currencies = Object.keys(collectedByCurrency) as Currency[];
  const mainCurrency: Currency = currencies.includes('EUR') ? 'EUR' : currencies[0] ?? 'EUR';
  const mainCollected = collectedByCurrency[mainCurrency] ?? 0;
  const otherCurrencies = currencies.filter((c) => c !== mainCurrency);

  const pendingCount = invoices.filter((inv) => inv.status === 'pending').length;
  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Bienvenue, {emitter.name}. Vue d'ensemble de votre activité.
          </p>
        </div>
        <Link
          href="/new-invoice"
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nouvelle facture
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-sm font-medium">Total Encaissé (Mois)</span>
            <ArrowUpRight size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-semibold text-zinc-900">
            {formatAmount(mainCollected, mainCurrency, 'FR')}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {paidThisMonth.length} facture{paidThisMonth.length > 1 ? 's' : ''} réglée
            {paidThisMonth.length > 1 ? 's' : ''} ce mois-ci
          </p>
          {otherCurrencies.length > 0 && (
            <p className="text-xs text-zinc-400 mt-1">
              + {otherCurrencies.map((c) => formatAmount(collectedByCurrency[c], c, 'FR')).join(' • ')}
            </p>
          )}
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-sm font-medium">En attente de paiement</span>
            <Clock size={18} className="text-amber-600" />
          </div>
          <div className="text-3xl font-semibold text-zinc-900">{pendingCount}</div>
          <p className="text-xs text-zinc-500 mt-1">Factures émises non échues</p>
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-sm font-medium">En retard</span>
            <AlertCircle size={18} className="text-rose-600" />
          </div>
          <div className="text-3xl font-semibold text-zinc-900">{overdueCount}</div>
          <p className="text-xs text-zinc-500 mt-1">Factures échues impayées</p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-zinc-900">Factures Récentes</h2>
          <span className="text-xs text-zinc-500">{invoices.length} factures au total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-6">N° Facture</th>
                <th className="py-3 px-6">Client</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Montant TTC</th>
                <th className="py-3 px-6">Statut</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {invoices.map((inv) => {
                const statusConfig = {
                  paid: { label: 'Payée', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
                  pending: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
                  overdue: { label: 'En retard', className: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle },
                }[inv.status];

                const StatusIcon = statusConfig.icon;

                return (
                  <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-900">{inv.number}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-zinc-900">{inv.client.name}</div>
                      <div className="text-xs text-zinc-500">{inv.client.country} • {inv.client.type}</div>
                    </td>
                    <td className="py-4 px-6 text-zinc-600">{inv.dateIssue}</td>
                    <td className="py-4 px-6 font-medium text-zinc-900">
                      {formatAmount(inv.totalTtc, inv.currency, inv.language)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", statusConfig.className)}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/invoice/${inv.id}`}
                        className="text-zinc-600 hover:text-zinc-900 font-medium text-xs border border-zinc-200 px-3 py-1.5 rounded hover:bg-zinc-100 transition-colors inline-block"
                      >
                        Voir PDF
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
