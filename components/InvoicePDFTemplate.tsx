import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { InvoiceData } from '@/types/invoice';

interface Atelier001PDFTemplateProps {
  invoiceData: InvoiceData;
}

Font.register({
  family: 'Julius Sans One',
  src: 'https://fonts.gstatic.com/s/juliussansone/v15/1Pt2g8TAX_SGgBGUi0tGOYEga5W-xXEW.woff2',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Julius Sans One',
    fontSize: 14,
    color: '#4D4D4D',
    padding: '40pt 50pt 25pt 50pt',
    letterSpacing: 1,
    lineHeight: 1.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '3.5em',
    position: 'relative',
  },
  logoWrapper: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  logo: {
    textAlign: 'center',
    width: 130,
    fontWeight: 400,
    fontSize: '1.5rem',
    letterSpacing: 2,
    lineHeight: 1.2,
  },
  pageCounter: {
    textAlign: 'right',
    fontSize: 10,
    color: '#AAA',
    marginTop: 10,
  },
  topInfo: {
    width: '100%',
    lineHeight: 1.4,
    fontSize: 11,
    marginTop: '1.5rem',
    marginBottom: '2.5rem',
    paddingLeft: 30,
  },
  infoTable: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    width: '45%',
    textAlign: 'left',
    fontWeight: 400,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  infoValue: {
    width: '55%',
    textAlign: 'left',
    fontSize: 11,
    lineHeight: 1.4,
  },
  leftTitle: {
    fontSize: '1rem',
    fontWeight: 400,
    marginBottom: '0.5em',
    letterSpacing: 0.5,
  },
  rightTitle: {
    fontSize: '1rem',
    fontWeight: 400,
    marginBottom: '0.5em',
    letterSpacing: 0.5,
  },
  lineItems: {
    width: '100%',
    paddingLeft: 30,
    marginBottom: '1.5rem',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  headerCol1: {
    width: '45%',
    textAlign: 'left',
    fontWeight: 400,
    fontSize: 11,
    color: '#777',
  },
  headerCol2: {
    width: '25%',
    textAlign: 'left',
    fontWeight: 400,
    fontSize: 11,
    color: '#777',
  },
  headerCol3: {
    width: '30%',
    textAlign: 'left',
    fontWeight: 400,
    fontSize: 11,
    color: '#777',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 4,
    fontSize: 11,
  },
  itemCell: {
    width: '45%',
  },
  priceCell: {
    width: '25%',
    textAlign: 'left',
  },
  totalCell: {
    width: '30%',
    textAlign: 'left',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  qtySection: {
    width: 80,
    flexShrink: 0,
  },
  qtyLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    paddingLeft: 16,
    position: 'absolute',
    left: 96,
    top: 0,
  },
  productName: {
    fontWeight: 500,
    marginBottom: 4,
    lineHeight: 1.3,
    fontSize: 11,
  },
  productSpecs: {
    color: '#666',
    lineHeight: 1.4,
    fontSize: 10,
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 11,
  },
  totalLabel: {
    width: '70%',
    textAlign: 'right',
  },
  totalValue: {
    width: '30%',
    textAlign: 'left',
  },
  finalTotal: {
    fontWeight: 500,
  },
  notes: {
    marginTop: '1.5rem',
    lineHeight: 1.4,
    paddingLeft: 30,
    marginBottom: '2.5rem',
    fontSize: 12,
  },
  secondNote: {
    marginVertical: '1.2rem',
  },
  bankDetails: {
    width: '100%',
    fontSize: 11,
    marginTop: '1rem',
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bankLabel: {
    width: '47%',
    textAlign: 'left',
    fontWeight: 400,
    textTransform: 'uppercase',
  },
  bankValue: {
    width: '53%',
    textAlign: 'left',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 100,
    right: 100,
    textAlign: 'center',
    lineHeight: 1.5,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  termsContentContainer: {
    paddingLeft: 30,
    marginBottom: '3rem',
  },
  contentWrapper: {
    letterSpacing: 1.2,
    fontSize: 8,
    lineHeight: 1.45,
    textAlign: 'justify',
    marginBottom: '3rem',
  },
  termsTitle: {
    marginTop: 15,
    marginBottom: 8,
    fontSize: 9,
    fontWeight: 500,
  },
  termsParagraph: {
    marginBottom: 8,
  },
});

export const Atelier001PDFTemplate: React.FC<Atelier001PDFTemplateProps> = ({ invoiceData }) => (
  <Document>
    {/* PAGE 01 - INVOICE */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logo}>ATELIER{'\n'}001</Text>
        </View>
        <Text style={styles.pageCounter}>PAGE 01 | 03</Text>
      </View>

      <View style={styles.topInfo}>
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { width: '45%' }]}>
              <Text style={styles.leftTitle}>PRO FORMA INVOICE</Text>
            </Text>
            <Text style={[styles.infoValue, { width: '55%' }]}>
              <Text style={styles.rightTitle}>RE{invoiceData.invoice_number}</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISSUE DATE</Text>
            <Text style={styles.infoValue}>{new Date(invoiceData.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CLIENT REFERENCE</Text>
            <Text style={styles.infoValue}>{invoiceData.client_reference || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DELIVERY TERMS</Text>
            <Text style={styles.infoValue}>{invoiceData.delivery_terms || 'EXW'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>COMPANY DETAILS</Text>
            <Text style={styles.infoValue}>
              {invoiceData.customer.name}{'\n'}
              {invoiceData.billing_address.line1 && `${invoiceData.billing_address.line1}\n`}
              {invoiceData.billing_address.line2 && `${invoiceData.billing_address.line2}\n`}
              {invoiceData.billing_address.city && `${invoiceData.billing_address.city}\n`}
              {invoiceData.billing_address.zip && `${invoiceData.billing_address.zip}\n`}
              {invoiceData.billing_address.country}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CONTACT</Text>
            <Text style={styles.infoValue}>{invoiceData.customer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EMAIL</Text>
            <Text style={styles.infoValue}>{invoiceData.customer.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PHONE</Text>
            <Text style={styles.infoValue}>{invoiceData.customer.phone || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.lineItems}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCol1}>ITEM DETAILS</Text>
          <Text style={styles.headerCol2}>PRICE PER ITEM</Text>
          <Text style={styles.headerCol3}>TOTAL</Text>
        </View>

        {invoiceData.line_items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.itemCell}>
              <View style={styles.itemContent}>
                <View style={styles.qtySection}>
                  <Text style={styles.qtyLabel}>QTY {item.quantity}</Text>
                  {item.image_url ? (
                    <Image src={item.image_url} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImage, { backgroundColor: '#F5F5F5' }]} />
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.productName}>{item.title}</Text>
                  <Text style={styles.productSpecs}>
                    {item.sku && `SKU: ${item.sku}`}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.priceCell}>{invoiceData.currency} {item.price.toFixed(2)}</Text>
            <Text style={styles.totalCell}>{invoiceData.currency} {item.total.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>SUBTOTAL</Text>
          <Text style={styles.totalValue}>{invoiceData.currency} {invoiceData.subtotal.toFixed(2)}</Text>
        </View>

        {invoiceData.discount_amount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Trade Discount {((invoiceData.discount_amount / invoiceData.subtotal) * 100).toFixed(0)}%</Text>
            <Text style={styles.totalValue}>- {invoiceData.currency} {invoiceData.discount_amount.toFixed(2)}</Text>
          </View>
        )}

        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={styles.totalLabel}>TOTAL EX VAT</Text>
          <Text style={styles.totalValue}>{invoiceData.currency} {invoiceData.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.notes}>
        <Text>A 100% advance payment is required to confirm the order. The lead time is 14–18 weeks from receipt of payment. Please review our terms and conditions overleaf.</Text>
        <Text style={styles.secondNote}>All the aforementioned costs are required to be settled via bank transfer. Please find the following bank details for the GBP payment:</Text>
        
        <View style={styles.bankDetails}>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>BANK NAME</Text>
            <Text style={styles.bankValue}>HSBC UK BANK PLC</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>BANK ADDRESS</Text>
            <Text style={styles.bankValue}>PO Box 1EZ 196 Oxford Street, London W1D 1NT, UK</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>IBAN</Text>
            <Text style={styles.bankValue}>GB36 HBUK 4005 1662 7431 08</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>SWIFT</Text>
            <Text style={styles.bankValue}>HBUKGB4B</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>ACCOUNT NAME</Text>
            <Text style={styles.bankValue}>{invoiceData.company.name}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>ACCOUNT NO</Text>
            <Text style={styles.bankValue}>62743108</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>SORT CODE</Text>
            <Text style={styles.bankValue}>40–05–16</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>ATELIER001 | UNIT 102 BUSPACE STUDIOS | CONLAN STREET | LONDON W10 5AP | UK</Text>
        <Text>INFO@ATELIER001.COM | T +44 (0)20 3778 0858 | REG 11953781 | VAT 334486800</Text>
      </View>
    </Page>

    {/* PAGE 02 - TERMS AND CONDITIONS */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logo}>ATELIER{'\n'}001</Text>
        </View>
        <Text style={styles.pageCounter}>PAGE 02 | 03</Text>
      </View>
      
      <View style={styles.termsContentContainer}>
        <View style={styles.contentWrapper}>
          <Text style={styles.termsTitle}>SALES TERMS & CONDITIONS</Text>
          <Text style={styles.termsParagraph}>For purposes of these T&Cs, Atelier001 Limited (company number 11953781), with its registered address at Unit 102 Buspace Studios, Conlan Street, London W10 5AP is referred to by its trading name, Atelier001.</Text>
          
          <Text style={styles.termsTitle}>PRICES AND DISCOUNTS</Text>
          <Text style={styles.termsParagraph}>Unless otherwise noted, all prices included in the pro forma invoice are valid for 30 days barring errors or omissions. Following that 30 day period, pricing may be subject to change without notice.</Text>
          
          <Text style={styles.termsTitle}>DESIGN MODIFICATIONS</Text>
          <Text style={styles.termsParagraph}>Modifications to products outside the standard specifications may be possible. All requests for modifications must be submitted in writing and are subject to Atelier001's approval. Additional lead time and charges will apply.</Text>
          
          <Text style={styles.termsTitle}>SPECIFICATIONS</Text>
          <Text style={styles.termsParagraph}>All drawings, dimensions, samples, descriptive visuals and specifications are intended as a guide only. Atelier001 reserves the right to change, alter or modify the design, dimensions, construction or costing of any item without prior written notice.</Text>
          
          <Text style={styles.termsTitle}>ORDER PROCESS</Text>
          <Text style={styles.termsParagraph}>Payment of the pro forma invoice is deemed the client's acceptance to these terms and conditions and confirmation of the client's order. If the order relates to a product with standard specifications, Atelier001 will send the client the relevant tear sheet. If the order relates to a product with non-standard specifications that have been requested in the order, Atelier001 will send a sign off document setting out design details and finishes. Atelier 001 will proceed with the order, as per the tear sheet or sign off document (as applicable), unless otherwise agreed by Atelier001 in writing. The pro forma invoice and these terms and conditions supersede all prior correspondence in relation to the client's order (verbal, written, graphic or otherwise).</Text>
          
          <Text style={styles.termsTitle}>CHANGES</Text>
          <Text style={styles.termsParagraph}>Atelier001 prides itself on adhering to given production times and begins production shortly after orders are confirmed. Therefore, Atelier001 is unable to change orders if manufacturing has already started. Once payment of the pro forma invoice has been made any request for subsequent changes must be sent in writing, and no guarantee can be given that the requested change may be made. Any change or cancellation agreed to by Atelier001 will result in additional costs and delays.</Text>
          
          <Text style={styles.termsTitle}>LEAD TIMES</Text>
          <Text style={styles.termsParagraph}>Atelier001 will provide an estimated delivery time following payment of the pro forma invoice and receipt of such funds by Atelier001. Current lead time are stated on the Atelier001 website. During holiday periods and times of high demand lead times may increase, in which event Atelier001 will inform the client following confirmation of the order. Please note that lead times may increase by up to four weeks due to manufacturer closures during the summer and Christmas holiday periods. Larger volume orders will almost certainly incur additional production time. Orders relating to bespoke products will also lead to longer lead times.</Text>
          
          <Text style={styles.termsTitle}>DELAYS</Text>
          <Text style={styles.termsParagraph}>The client must respond to any request for a decision or approval from Atelier001 with respect to all specification issues and with respect to any other matter relating to the this agreement within five business days of such request. If the client fails to respond for more than 20 business days to a written request, Atelier001 reserves the right to cancel the order with no refund nor delivery of a product. The client is responsible and may be invoiced for all costs and expenses incurred by Atelier001 as a result of: (1) delays caused by the client's actions or failure to act, including failure to respond promptly to reasonable requests (for approvals or otherwise); (2) delays otherwise outside Atelier001's control (including with respect to a force majeure event described below); and (3) any changes to the specifications described in the relevant tear sheet or sign off document for whatever reason. Those costs and expenses may include, if applicable, storage costs, including transport to and from storage; costs related to changes in production; and changes in material costs arising as a result of the delay or specification change, including higher component costs resulting from inflation and third party supplier pricing changes.</Text>
          
          <Text style={styles.termsTitle}>FORCE MAJEURE</Text>
          <Text style={styles.termsParagraph}>Atelier001 shall not be in breach of our agreement nor liable for failure to perform or for delay in performing any of its obligations if such delay or failure results from events, circumstnances or causes beyond its reasonable control, including, without limitation, due to regional national or global pandemics such as the COVID-19 crisis, fire, flood, strike or other labour difficulty, act of God, act of any governmental authority or of the client, riot, embargo, fuel or energy shortage, wrecks or delay in transportation, inability to obtain necessary labour, materials or manufacturing facilities from usual sources or failure of suppliers to meet their contractual obligations. If any such event occurs, Atelier001 may extend delivery date by a period of time necessary to overcome the effect of such delay, allocate available product or cancel any order. Whilst Atelier001 will make every effort to achieve nominated delivery dates, delays do not constitute a breach of contract and Atelier001 will not be liable for any resulting costs or expenses.</Text>
          
          <Text style={styles.termsTitle}>PAYMENT</Text>
          <Text style={styles.termsParagraph}>The standard payment terms are 100% via bank transfer or as otherwise agreed. Orders and payments are non-refundable.</Text>
          
          <Text style={styles.termsTitle}>SHIPPING</Text>
          <Text style={styles.termsParagraph}>Delivery times will be arranged with the client once goods are ready for dispatch. Once an order is dispatched and tracking numbers sent, it is the client's responsibility to track the item online and ensure it cleared by customs at the other end. All customs duties and taxes are the client's responsibility. The shipping charge covers a single delivery at ground level during normal weekday delivery hours. While Atelier001 uses a premium freight service, transit times are beyond Atelier001's control and it will not be liable for</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>ATELIER001 | UNIT 102 BUSPACE STUDIOS | CONLAN STREET | LONDON W10 5AP | UK</Text>
        <Text>INFO@ATELIER001.COM | T +44 (0)20 3778 0858 | REG 11953781 | VAT 334486800</Text>
      </View>
    </Page>

    {/* PAGE 03 - CONTINUATION */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logo}>ATELIER{'\n'}001</Text>
        </View>
        <Text style={styles.pageCounter}>PAGE 03 | 03</Text>
      </View>
      
      <View style={styles.termsContentContainer}>
        <View style={styles.contentWrapper}>
          <Text style={styles.termsParagraph}>any cost or expense related to a delay. In addition, Atelier001 will not be responsible for any damage to a product once it has been shipped. The client is responsible for checking that all goods have free and easy access to their intended destination. Prior to delivery the client must provide Atelier001 with full written details of any difficulty to access, e.g., stairs, delivery dock, lift etc. Atelier001 reserves the right to charge additional costs for unusual access not advised in writing. Atlier001 offers an inspection service, with an additional fee, prior to order commencement for potential difficult deliveries. Should delivery prove impossible, Atelier001 may require the client to accept the goods and make their own arrangements for delivery. Cancellation of a booked delivery is subject to a cancellation fee equivalent to the standard delivery price, should notice be given later than 24 hours prior to the booked delivery date. If the client is unable to accept delivery within 7 days from Atelier001's first call following the completion of the client's order, Atelier001 will charge a storage fee of 1% of the value of goods per month or £100 per week (whichever is higher). These charges may vary if the order is of a larger volume.</Text>
          
          <Text style={styles.termsTitle}>DELIVERY AND INSPECTION</Text>
          <Text style={styles.termsParagraph}>Inspection of products by the client is required upon delivery. Any damage must be noted on the delivery documents presented to the client by carrier for signature, along with documentation and photographs of the item(s) and packaging. If damage has occurred during shipping all packaging must be retained by the client. Failure to retain packaging and/or provide photographic evidence may invalidate any insurance claim. Any damage to the product must be documented and reported within 10 working days of receipt. Atelier001 is not responsible for any repairs or replacements relating to damages reported after this time.</Text>
          
          <Text style={styles.termsTitle}>DAMAGES</Text>
          <Text style={styles.termsParagraph}>Atelier001 is not responsible for the following: • Damage caused by improper installation or assembly by the client or their agent. The client must use suitably qualified personnel for installation and assembly at the client's property. • Damage caused by improper cleaning solutions or methods. • Damage caused to the products, parts of the products, or shades, by the improper use and installation of electrical connections. • Damage caused by exposure to weather or improper environent. • Changes in the appearance of hand rubbed finishes or unlacquered finishes—these are meant to age in appearance. • Any costs of installation, removal or reinstallation. • Restoration or repair work. • Any parts purchased separately from Atelier001's products. Please note that Atelier001 will endeavour to provide an appropriate electrical transformer, but a suitably qualified electrician must be used by the client for installation. For certain systems, the client may need to purchase a different driver or transformer, which will be done at the client's cost.</Text>
          
          <Text style={styles.termsTitle}>MATERIAL VARIATION</Text>
          <Text style={styles.termsParagraph}>Each batch of products differs as they are made to order and can be subject to slight colour and material variation. Because many parts of the products are handmade, orders for a series or pair of products may result in series or pairs that are not identical. Slight variation from specifications or from similar products will not be accepted as a reason to reject an item produced by Atelier001. Small imperfections in the products are to be expected due to the handmade nature of the products.</Text>
          
          <Text style={styles.termsTitle}>RETURNS</Text>
          <Text style={styles.termsParagraph}>Each piece is manufactured following order confirmation. Due to the made to order and bespoke nature of Atelier001's products, Atelier001 is not able to offer returns.</Text>
          
          <Text style={styles.termsTitle}>CANCELLATIONS</Text>
          <Text style={styles.termsParagraph}>Atelier001 reserves the right to cancel any order at any time for whatever reason, in which case all funds paid by the client will be returned. Due to the made to order and bespoke nature of Atelier001's products, orders cannot be cancelled by the client.</Text>
          
          <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
          <Text style={styles.termsParagraph}>The terms and conditions in this document, together with the pro forma invoice relating to the client's order, form our agreement with the client. These terms and conditions may be modified or supplemented only by a written document signed by an authorized representative of Atelier001. These terms and conditions supersede any prior and/or contemporaneous agreements or correspondence between Atelier001 and the client. Atelier001 reserves the right to change these terms and conditions without notice, but such changes will not be binding on the client following order confirmation.</Text>
          
          <Text style={styles.termsTitle}>LEGAL COMPLIANCE</Text>
          <Text style={styles.termsParagraph}>The client is solely responsible for compliance with all laws, ordinances, regulations, rules and standards relating to the installation, maintenance, use and operation of the products.</Text>
          
          <Text style={styles.termsTitle}>LIMITATIONS OF LIABILITY</Text>
          <Text style={styles.termsParagraph}>Atelier001, its contractors and subcontractors or suppliers of any tier shall not be liable to the client for any special, indirect, incidental or consequential damages arising from Products or from a breach of this Agreement. The client's remedies set forth herein are exclusive. The liability of Atelier001 with respect to the breach of this agreement or any contract entered into between the parties pursuant hereto shall not exceed the price of the product(s) that are the subject of the order or part on which such liability is based. To the extent that the laws of any jurisdiction do not permit limitations or exclusions of implied warranties, incidental damages and consequential damages, the above limitations may not apply. The terms implied by sections 13 to 15 of the Sale of Goods Act 1979 and the terms implied by sections 3 to 5 of the Supply of Goods and Services Act 1982 are, to the fullest extent permitted by law, excluded. The agreement, including these terms and conditions, is governed by the laws of England and Wales.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>ATELIER001 | UNIT 102 BUSPACE STUDIOS | CONLAN STREET | LONDON W10 5AP | UK</Text>
        <Text>INFO@ATELIER001.COM | T +44 (0)20 3778 0858 | REG 11953781 | VAT 334486800</Text>
      </View>
    </Page>
  </Document>
);