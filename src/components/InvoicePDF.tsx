import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Invoice, Language } from '@/types';
import { formatAmount } from '@/lib/vat-engine';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#18181b',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  emitterBlock: {
    width: '45%',
  },
  invoiceInfoBlock: {
    width: '45%',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#09090b',
  },
  bold: {
    fontWeight: 'bold',
  },
  clientSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#52525b',
    textTransform: 'uppercase',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colDesc: { width: '55%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 4,
  },
  totalBold: {
    fontWeight: 'bold',
    fontSize: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 4,
  },
  legalSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fafafa',
    borderLeftWidth: 3,
    borderLeftColor: '#18181b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#71717a',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 10,
    textAlign: 'center',
  },
});

interface Labels {
  docTitle: string;
  issued: string;
  due: string;
  billedTo: string;
  country: string;
  vatIntra: string;
  vatNumber: string;
  siret: string;
  email: string;
  description: string;
  qty: string;
  unitPrice: string;
  lineTotal: string;
  totalHt: string;
  totalVat: string;
  totalTtc: string;
  legalTitle: string;
  footerFr: string;
  footerEn: string;
}

/**
 * The French penalty clause is mandatory on French invoices and is therefore
 * always printed; for English invoices we append an English translation so the
 * foreign client understands the payment terms.
 */
const FOOTER_FR =
  "Pénalités de retard : 3 fois le taux d'intérêt légal. Indemnité forfaitaire pour frais de recouvrement : 40 €. Pas d'escompte pour paiement anticipé.";
const FOOTER_EN =
  'Late payment penalties: 3 times the legal interest rate. Fixed compensation for recovery costs: 40 €. No discount for early payment.';

const LABELS: Record<Language, Labels> = {
  FR: {
    docTitle: 'FACTURE',
    issued: "Date d'émission",
    due: "Date d'échéance",
    billedTo: 'Facturé à :',
    country: 'Pays',
    vatIntra: 'N° TVA Intracom',
    vatNumber: 'N° TVA',
    siret: 'SIRET',
    email: 'Email',
    description: 'Description',
    qty: 'Qté',
    unitPrice: 'Prix Unit.',
    lineTotal: 'Total HT',
    totalHt: 'Total HT',
    totalVat: 'TVA',
    totalTtc: 'Total TTC',
    legalTitle: 'Mention légale TVA :',
    footerFr: FOOTER_FR,
    footerEn: FOOTER_EN,
  },
  EN: {
    docTitle: 'INVOICE',
    issued: 'Issue date',
    due: 'Due date',
    billedTo: 'Billed to:',
    country: 'Country',
    vatIntra: 'VAT no.',
    vatNumber: 'VAT no.',
    siret: 'SIRET',
    email: 'Email',
    description: 'Description',
    qty: 'Qty',
    unitPrice: 'Unit price',
    lineTotal: 'Amount excl. VAT',
    totalHt: 'Total excl. VAT',
    totalVat: 'VAT',
    totalTtc: 'Total incl. VAT',
    legalTitle: 'VAT legal mention:',
    footerFr: FOOTER_FR,
    footerEn: FOOTER_EN,
  },
};

interface InvoicePDFProps {
  invoice: Invoice;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const { emitter, client, items, currency, language } = invoice;
  const t = LABELS[language] ?? LABELS.FR;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.emitterBlock}>
            <Text style={styles.title}>{emitter.name}</Text>
            <Text>{emitter.address}</Text>
            <Text>
              {t.siret} : {emitter.siret}
            </Text>
            <Text>
              {t.email} : {emitter.email}
            </Text>
            {emitter.vatNumber ? (
              <Text>
                {t.vatNumber} : {emitter.vatNumber}
              </Text>
            ) : null}
          </View>
          <View style={styles.invoiceInfoBlock}>
            <Text style={styles.title}>{t.docTitle}</Text>
            <Text style={styles.bold}>{invoice.number}</Text>
            <Text>
              {t.issued} : {invoice.dateIssue}
            </Text>
            <Text>
              {t.due} : {invoice.dateDue}
            </Text>
          </View>
        </View>

        {/* Client Block */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>{t.billedTo}</Text>
          <Text style={styles.bold}>{client.name}</Text>
          <Text>{client.address}</Text>
          <Text>
            {t.country} : {client.country}
          </Text>
          {client.vatNumber ? (
            <Text>
              {t.vatIntra} : {client.vatNumber}
            </Text>
          ) : null}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>{t.description}</Text>
            <Text style={styles.colQty}>{t.qty}</Text>
            <Text style={styles.colPrice}>{t.unitPrice}</Text>
            <Text style={styles.colTotal}>{t.lineTotal}</Text>
          </View>
          {items.map((item, index) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>
                  {formatAmount(item.unitPrice, currency, language)}
                </Text>
                <Text style={styles.colTotal}>
                  {formatAmount(lineTotal, currency, language)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>{t.totalHt} :</Text>
            <Text>{formatAmount(invoice.totalHt, currency, language)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>
              {t.totalVat} ({invoice.vatRate}%) :
            </Text>
            <Text>{formatAmount(invoice.totalVat, currency, language)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalBold]}>
            <Text>{t.totalTtc} :</Text>
            <Text>{formatAmount(invoice.totalTtc, currency, language)}</Text>
          </View>
        </View>

        {/* Legal Mentions */}
        {invoice.legalMention ? (
          <View style={styles.legalSection}>
            <Text style={styles.bold}>{t.legalTitle}</Text>
            <Text>{invoice.legalMention}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{t.footerFr}</Text>
          {language === 'EN' ? (
            <Text style={{ marginTop: 2 }}>{t.footerEn}</Text>
          ) : null}
          <Text style={{ marginTop: 4 }}>
            IBAN : {emitter.iban} — {t.siret} : {emitter.siret}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
