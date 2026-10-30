# FactureB2B

MVP de facturation pour freelances français ayant des clients **professionnels à l'étranger**.

Stack : **Next.js 14 (App Router) · TypeScript · Tailwind CSS 3 · Zustand (persist) · @react-pdf/renderer · Vitest**

Aucune base de données, aucun compte : tout est persisté dans le `localStorage` du navigateur (`facture-b2b-storage`), amorcé avec un émetteur et 4 factures de démonstration.

## Démarrage

```bash
npm install --legacy-peer-deps
npm run dev     # http://localhost:3000
npm test        # tests unitaires du moteur de TVA
npm run build   # build de production
```

> `--legacy-peer-deps` est requis car `@react-pdf/renderer` déclare `react` en peer dependency `^16 || ^17 || ^18 || ^19` et vitest 2 embarque ses propres types.

## Structure

```
src/
├── app/
│   ├── layout.tsx              Sidebar + zone de contenu (Suspense)
│   ├── page.tsx                Dashboard : métriques + tableau des factures
│   ├── new-invoice/page.tsx    Formulaire de création (TVA temps réel)
│   ├── settings/page.tsx       Paramètres émetteur + numérotation
│   └── invoice/[id]/page.tsx   Aperçu facture + export PDF + statut
├── components/
│   ├── Sidebar.tsx             Navigation (état actif via usePathname)
│   └── InvoicePDF.tsx          Document PDF vectoriel A4 (FR/EN)
├── lib/
│   ├── vat-engine.ts           Règles de TVA + validation VIES simulée + formatage
│   ├── vat-engine.test.ts      7 tests, une assertion par règle
│   └── utils.ts                cn() (clsx + tailwind-merge)
├── store/useInvoiceStore.ts    Store Zustand persisté + données mock
└── types/index.ts              Types du domaine
```

## Moteur de TVA (`src/lib/vat-engine.ts`)

`calculateVat(emitter, client)` applique les règles dans cet ordre de priorité :

| # | Situation | Taux | Mention |
|---|-----------|------|---------|
| 1 | Émetteur en franchise (293 B) | 0 % | TVA non applicable, art. 293 B du CGI |
| 2 | Client en France | 20 % | — |
| 3 | UE hors France + professionnel + n° TVA valide (VIES simulé) | 0 % | Autoliquidation – art. 259-1 du CGI / Reverse charge – art. 196 Directive 2006/112/CE |
| 3b | UE hors France + professionnel + n° TVA absent/invalide | 20 % | ⚠️ alerte « TVA absent ou invalide » |
| 4 | UE hors France + particulier | 20 % | ⚠️ « Cas particulier hors périmètre MVP » (informatif) |
| 5 | Hors UE + professionnel | 0 % | TVA non applicable – art. 259-1 du CGI / VAT not applicable |

La simulation VIES considère un numéro valide s'il commence par le code pays du client suivi de 8 à 12 caractères alphanumériques (`^DE[A-Z0-9]{8,12}$`).

## Montants

Tous les montants sont stockés en **centimes (entiers)**. Le seul point de conversion est [`formatAmount()`](src/lib/vat-engine.ts:88), qui s'appuie sur `Intl.NumberFormat` (locale `fr-FR` ou `en-US` selon la langue de la facture).

## Numérotation

Format `FB-2026-0001`, séquentiel sans trou. Le compteur (`emitter.invoiceCount`) est incrémenté **après** l'enregistrement de la facture, dans `handleSubmit`, ce qui garantit qu'aucun numéro n'est consommé si le formulaire échoue.

## PDF

[`InvoicePDF`](src/components/InvoicePDF.tsx:1) génère un A4 vectoriel (texte sélectionnable, aucune capture d'écran) : en-tête émetteur, bloc client, numéro et dates, tableau des lignes, Total HT / TVA / TTC, mention légale de TVA et pied de page obligatoire :

> Pénalités de retard : 3 fois le taux d'intérêt légal. Indemnité forfaitaire pour frais de recouvrement : 40 €. Pas d'escompte pour paiement anticipé.

Les libellés basculent en anglais lorsque la facture est émise en `EN` ; la clause française reste imprimée (obligation légale) accompagnée de sa traduction.
