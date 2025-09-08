import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { InvoiceData } from '@/types/invoice';

interface InvoicePDFTemplateProps {
  invoiceData: InvoiceData;
}

const styles = StyleSheet.create({
  tableColImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  imageContainer: {
    width: 30,
    height: 30,
    overflow: 'hidden',
    borderRadius: 2,
    border: '0.5pt solid #dee2e6',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 30,
    height: 30,
    objectFit: 'cover',
  },
  noImageText: {
    fontSize: 6,
    color: '#999',
    textAlign: 'center',
  },

  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  companyInfo: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressLine: {
    marginBottom: 2,
    color: '#666',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderBottom: '1pt solid #dee2e6',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5pt solid #dee2e6',
  },
  tableColItem: {
    flex: 3,
    fontSize: 9,
  },
  tableColQty: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
  },
  tableColPrice: {
    flex: 1.5,
    textAlign: 'right',
    fontSize: 9,
  },
  tableColTotal: {
    flex: 1.5,
    textAlign: 'right',
    fontSize: 9,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 9,
  },
  totalsSection: {
    alignSelf: 'flex-end',
    width: 200,
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  totalLabel: {
    fontSize: 9,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderTop: '1pt solid #1a1a1a',
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '0.5pt solid #dee2e6',
  },
  footerSection: {
    marginBottom: 15,
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footerText: {
    fontSize: 8,
    color: '#666',
    lineHeight: 1.4,
  },
});

export const InvoicePDFTemplate: React.FC<InvoicePDFTemplateProps> = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INVOICE</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{invoiceData.company.name}</Text>
          <Text style={styles.addressLine}>{invoiceData.company.address.line1}</Text>
          {invoiceData.company.address.line2 && (
            <Text style={styles.addressLine}>{invoiceData.company.address.line2}</Text>
          )}
          <Text style={styles.addressLine}>
            {invoiceData.company.address.city}, {invoiceData.company.address.state} {invoiceData.company.address.zip}
          </Text>
          <Text style={styles.addressLine}>{invoiceData.company.address.country}</Text>
          <Text style={styles.addressLine}>{invoiceData.company.phone}</Text>
        </View>
      </View>

      {/* Invoice Details and Customer Info */}
      <View style={styles.invoiceDetails}>
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Number:</Text>
            <Text style={styles.detailValue}>{invoiceData.invoice_number}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(invoiceData.invoice_date).toLocaleDateString()}
            </Text>
          </View>
          {invoiceData.client_reference && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference:</Text>
              <Text style={styles.detailValue}>{invoiceData.client_reference}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={[styles.detailValue, { fontWeight: 'bold', marginBottom: 4 }]}>
            {invoiceData.customer.name}
          </Text>
          <Text style={styles.detailValue}>{invoiceData.customer.email}</Text>
          {invoiceData.customer.phone && (
            <Text style={styles.detailValue}>{invoiceData.customer.phone}</Text>
          )}
          {invoiceData.billing_address.line1 && (
            <>
              <Text style={styles.detailValue}>{invoiceData.billing_address.line1}</Text>
              {invoiceData.billing_address.line2 && (
                <Text style={styles.detailValue}>{invoiceData.billing_address.line2}</Text>
              )}
              <Text style={styles.detailValue}>
                {invoiceData.billing_address.city}, {invoiceData.billing_address.state} {invoiceData.billing_address.zip}
              </Text>
              <Text style={styles.detailValue}>{invoiceData.billing_address.country}</Text>
            </>
          )}
        </View>
      </View>

      {/* Line Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableColImage, styles.tableHeaderText]}>Image</Text>
          <Text style={[styles.tableColItem, styles.tableHeaderText]}>Item</Text>
          <Text style={[styles.tableColQty, styles.tableHeaderText]}>Qty</Text>
          <Text style={[styles.tableColPrice, styles.tableHeaderText]}>Price</Text>
          <Text style={[styles.tableColTotal, styles.tableHeaderText]}>Total</Text>
        </View>

        {invoiceData.line_items.map((item, index) => (
  <View key={index} style={styles.tableRow}>
    <View style={styles.tableColImage}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.productImage}
          />
        ) : (
          <Text style={styles.noImageText}>No{'\n'}Image</Text>
        )}
      </View>
    </View>
    <View style={styles.tableColItem}>
      <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{item.title}</Text>
      {item.sku && <Text style={{ color: '#666', fontSize: 8 }}>SKU: {item.sku}</Text>}
    </View>
    <Text style={styles.tableColQty}>{item.quantity}</Text>
    <Text style={styles.tableColPrice}>
      {invoiceData.currency} {item.price.toFixed(2)}
    </Text>
    <Text style={styles.tableColTotal}>
      {invoiceData.currency} {item.total.toFixed(2)}
    </Text>
  </View>
))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>
            {invoiceData.currency} {invoiceData.subtotal.toFixed(2)}
          </Text>
        </View>
        
        {invoiceData.tax_amount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>
              {invoiceData.currency} {invoiceData.tax_amount.toFixed(2)}
            </Text>
          </View>
        )}
        
        {invoiceData.shipping_cost > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping:</Text>
            <Text style={styles.totalValue}>
              {invoiceData.currency} {invoiceData.shipping_cost.toFixed(2)}
            </Text>
          </View>
        )}
        
        {invoiceData.discount_amount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount:</Text>
            <Text style={styles.totalValue}>
              -{invoiceData.currency} {invoiceData.discount_amount.toFixed(2)}
            </Text>
          </View>
        )}
        
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>
            {invoiceData.currency} {invoiceData.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {invoiceData.delivery_terms && (
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Delivery Terms</Text>
            <Text style={styles.footerText}>{invoiceData.delivery_terms}</Text>
          </View>
        )}
        
        {invoiceData.terms && (
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Terms & Conditions</Text>
            <Text style={styles.footerText}>{invoiceData.terms}</Text>
          </View>
        )}
      </View>
    </Page>
  </Document>
);