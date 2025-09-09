'use client';

import { InvoiceData } from '@/types/invoice';

interface Atelier001PreviewProps {
  invoiceData: InvoiceData;
  productImages: Record<number, string>;
}

export default function Atelier001Preview({ invoiceData, productImages }: Atelier001PreviewProps) {
  
  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="max-w-full mx-auto bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
        
        {/* PAGE 01 - INVOICE */}
        <div style={{ padding: '40px 50px 25px 50px', fontFamily: 'Julius Sans One, sans-serif', letterSpacing: '1px', lineHeight: '1.8', color: '#4D4D4D', fontSize: '14px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5em', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '130px' }}>
              <div style={{ textAlign: 'center', fontWeight: 400, fontSize: '1.5rem', letterSpacing: '2px', lineHeight: '1.2' }}>
                ATELIER<br />001
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10px', color: '#AAA', marginLeft: 'auto' }}>
              PAGE 01 | 03
            </div>
          </div>

          {/* Top Info Section */}
          <div style={{ width: '100%', lineHeight: '1.4', fontSize: '11px', marginTop: '1.5rem', marginBottom: '2.5rem', paddingLeft: '30px' }}>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 400, marginBottom: '0.5em', letterSpacing: '0.5px' }}>
                    PRO FORMA INVOICE
                  </div>
                </div>
                <div style={{ width: '55%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 400, marginBottom: '0.5em', letterSpacing: '0.5px' }}>
                    RE{invoiceData.invoice_number}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase' }}>ISSUE DATE</div>
                <div style={{ width: '55%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                  {new Date(invoiceData.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase' }}>CLIENT REFERENCE</div>
                <div style={{ width: '55%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                  {invoiceData.client_reference || 'N/A'}
                </div>
              </div>
              
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase' }}>DELIVERY TERMS</div>
                <div style={{ width: '55%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                  {invoiceData.delivery_terms || 'EXW'}
                </div>
              </div>
              
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase' }}>COMPANY DETAILS</div>
                <div style={{ width: '55%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                  {invoiceData.customer.name}<br />
                  {invoiceData.billing_address.line1 && <>{invoiceData.billing_address.line1}<br /></>}
                  {invoiceData.billing_address.line2 && <>{invoiceData.billing_address.line2}<br /></>}
                  {invoiceData.billing_address.city && <>{invoiceData.billing_address.city}<br /></>}
                  {invoiceData.billing_address.zip && <>{invoiceData.billing_address.zip}<br /></>}
                  {invoiceData.billing_address.country}
                </div>
              </div>
              
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase' }}>CONTACT</div>
                <div style={{ width: '55%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                  {invoiceData.customer.name}
                </div>
              </div>
              
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase' }}>EMAIL</div>
                <div style={{ width: '55%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                  {invoiceData.customer.email}
                </div>
              </div>
              
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase' }}>PHONE</div>
                <div style={{ width: '55%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                  {invoiceData.customer.phone || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div style={{ width: '100%', paddingLeft: '30px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', paddingTop: '6px', paddingBottom: '12px', paddingLeft: '4px', paddingRight: '4px' }}>
              <div style={{ width: '45%', textAlign: 'left', fontWeight: 400, fontSize: '11px', color: '#777' }}>ITEM DETAILS</div>
              <div style={{ width: '25%', textAlign: 'left', fontWeight: 400, fontSize: '11px', color: '#777' }}>PRICE PER ITEM</div>
              <div style={{ width: '30%', textAlign: 'left', fontWeight: 400, fontSize: '11px', color: '#777' }}>TOTAL</div>
            </div>

            {invoiceData.line_items.map((item, index) => (
              <div key={index} style={{ display: 'flex', paddingTop: '15px', paddingBottom: '15px', paddingLeft: '4px', paddingRight: '4px', fontSize: '11px' }}>
                <div style={{ width: '45%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{ width: '80px', flexShrink: 0 }}>
                      <div style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>
                        QTY {item.quantity}
                      </div>
                      {item.product_id && productImages[item.product_id] ? (
                        <img
                          src={productImages[item.product_id]}
                          alt={item.title}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#F5F5F5', borderRadius: '4px', display: 'block' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingLeft: '16px', position: 'absolute', left: '96px', top: 0 }}>
                      <div style={{ fontWeight: 500, marginBottom: '4px', lineHeight: '1.3', fontSize: '11px' }}>
                        {item.title}
                      </div>
                      <div style={{ color: '#666', lineHeight: '1.4', fontSize: '10px' }}>
                        {item.sku && `SKU: ${item.sku}`}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ width: '25%', textAlign: 'left' }}>
                  {invoiceData.currency} {item.price.toFixed(2)}
                </div>
                <div style={{ width: '30%', textAlign: 'left' }}>
                  {invoiceData.currency} {item.total.toFixed(2)}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', paddingTop: '6px', paddingBottom: '6px', paddingLeft: '4px', paddingRight: '4px', fontSize: '11px' }}>
              <div style={{ width: '70%', textAlign: 'right' }}>SUBTOTAL</div>
              <div style={{ width: '30%', textAlign: 'left' }}>
                {invoiceData.currency} {invoiceData.subtotal.toFixed(2)}
              </div>
            </div>

            {invoiceData.discount_amount > 0 && (
              <div style={{ display: 'flex', paddingTop: '6px', paddingBottom: '6px', paddingLeft: '4px', paddingRight: '4px', fontSize: '11px' }}>
                <div style={{ width: '70%', textAlign: 'right' }}>
                  Trade Discount {((invoiceData.discount_amount / invoiceData.subtotal) * 100).toFixed(0)}%
                </div>
                <div style={{ width: '30%', textAlign: 'left' }}>
                  - {invoiceData.currency} {invoiceData.discount_amount.toFixed(2)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', paddingTop: '6px', paddingBottom: '6px', paddingLeft: '4px', paddingRight: '4px', fontSize: '11px', fontWeight: 500 }}>
              <div style={{ width: '70%', textAlign: 'right' }}>TOTAL EX VAT</div>
              <div style={{ width: '30%', textAlign: 'left' }}>
                {invoiceData.currency} {invoiceData.total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginTop: '1.5rem', lineHeight: '1.4', paddingLeft: '30px', marginBottom: '2.5rem', fontSize: '12px' }}>
            <p>A 100% advance payment is required to confirm the order. The lead time is 14–18 weeks from receipt of payment. Please review our terms and conditions overleaf.</p>
            <p style={{ marginTop: '1.2rem', marginBottom: '1.2rem' }}>All the aforementioned costs are required to be settled via bank transfer. Please find the following bank details for the GBP payment:</p>
            
            <div style={{ width: '100%', fontSize: '11px', marginTop: '1rem' }}>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '47%', textAlign: 'left', fontWeight: 400, textTransform: 'uppercase' }}>BANK NAME</div>
                <div style={{ width: '53%', textAlign: 'left' }}>HSBC UK BANK PLC</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '47%', textAlign: 'left', fontWeight: 400, textTransform: 'uppercase' }}>BANK ADDRESS</div>
                <div style={{ width: '53%', textAlign: 'left' }}>PO Box 1EZ 196 Oxford Street, London W1D 1NT, UK</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '47%', textAlign: 'left', fontWeight: 400, textTransform: 'uppercase' }}>IBAN</div>
                <div style={{ width: '53%', textAlign: 'left' }}>GB36 HBUK 4005 1662 7431 08</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '47%', textAlign: 'left', fontWeight: 400, textTransform: 'uppercase' }}>SWIFT</div>
                <div style={{ width: '53%', textAlign: 'left' }}>HBUKGB4B</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '47%', textAlign: 'left', fontWeight: 400, textTransform: 'uppercase' }}>ACCOUNT NAME</div>
                <div style={{ width: '53%', textAlign: 'left' }}>{invoiceData.company.name}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '47%', textAlign: 'left', fontWeight: 400, textTransform: 'uppercase' }}>ACCOUNT NO</div>
                <div style={{ width: '53%', textAlign: 'left' }}>62743108</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '47%', textAlign: 'left', fontWeight: 400, textTransform: 'uppercase' }}>SORT CODE</div>
                <div style={{ width: '53%', textAlign: 'left' }}>40–05–16</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}