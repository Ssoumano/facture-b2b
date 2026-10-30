'use client';

import { useInvoiceStore } from '@/store/useInvoiceStore';
import React, { useState } from 'react';
import { Save, Building2, ShieldCheck, Hash } from 'lucide-react';

export default function SettingsPage() {
  const { emitter, updateEmitter } = useInvoiceStore();
  const [formData, setFormData] = useState(emitter);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmitter(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Paramètres Émetteur</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Configurez vos informations légales et vos préférences de facturation.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-sm">
          Paramètres enregistrés avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 text-zinc-900 font-medium">
            <Building2 size={18} />
            <h2>Informations Générales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Nom / Société</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Adresse complète</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">SIRET</label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">IBAN</label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>
          </div>
        </div>

        {/* VAT Status */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 text-zinc-900 font-medium">
            <ShieldCheck size={18} />
            <h2>Régime de TVA</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50">
              <input
                type="radio"
                name="vatStatus"
                checked={formData.vatStatus === 'franchise'}
                onChange={() =>
                  setFormData({ ...formData, vatStatus: 'franchise', vatNumber: undefined })
                }
                className="mt-1"
              />
              <div>
                <span className="block text-sm font-medium text-zinc-900">Franchise en base (art. 293 B du CGI)</span>
                <span className="block text-xs text-zinc-500">La TVA n'est pas facturée (TVA 0% partout).</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50">
              <input
                type="radio"
                name="vatStatus"
                checked={formData.vatStatus === 'assujetti'}
                onChange={() => setFormData({ ...formData, vatStatus: 'assujetti' })}
                className="mt-1"
              />
              <div>
                <span className="block text-sm font-medium text-zinc-900">Assujetti à la TVA</span>
                <span className="block text-xs text-zinc-500">Application des règles standard de TVA et autoliquidation.</span>
              </div>
            </label>
          </div>

          {formData.vatStatus === 'assujetti' && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">N° TVA Intracommunautaire (FR)</label>
              <input
                type="text"
                value={formData.vatNumber || ''}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                placeholder="FR12345678901"
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>
          )}
        </div>

        {/* Counter Settings */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 text-zinc-900 font-medium">
            <Hash size={18} />
            <h2>Numérotation des Factures</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Préfixe</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Prochain numéro (Compteur)</label>
              <input
                type="number"
                value={formData.invoiceCount}
                onChange={(e) => setFormData({ ...formData, invoiceCount: parseInt(e.target.value) || 0 })}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
              <span className="text-xs text-zinc-500 mt-1 block">
                Aperçu du prochain numéro : {formData.invoicePrefix}{String(formData.invoiceCount + 1).padStart(4, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Save size={16} />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
