'use client';

import { InvoiceData } from '@/types/invoice';

interface CleanPDFPreviewProps {
  invoiceData: InvoiceData;
  productImages: Record<number, string>;
}

export default function CleanPDFPreview({ invoiceData, productImages }: CleanPDFPreviewProps) {
  
  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="max-w-full mx-auto bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">INVOICE</h1>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-black">{invoiceData.company.name}</h2>
            <p className="text-sm text-black">{invoiceData.company.address.line1}</p>
            {invoiceData.company.address.line2 && (
              <p className="text-sm text-black">{invoiceData.company.address.line2}</p>
            )}
            <p className="text-sm text-black">
              {invoiceData.company.address.city}, {invoiceData.company.address.state} {invoiceData.company.address.zip}
            </p>
            <p className="text-sm text-black">{invoiceData.company.address.country}</p>
            <p className="text-sm text-black">{invoiceData.company.phone}</p>
          </div>
        </div>

        {/* Invoice Details and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-bold text-black mb-2">Invoice Details</h3>
            <p className="text-sm text-black"><span className="font-medium">Number:</span> {invoiceData.invoice_number}</p>
            <p className="text-sm text-black"><span className="font-medium">Date:</span> {new Date(invoiceData.invoice_date).toLocaleDateString()}</p>
            {invoiceData.client_reference && (
              <p className="text-sm text-black"><span className="font-medium">Reference:</span> {invoiceData.client_reference}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-black mb-2">Bill To</h3>
            <p className="text-sm font-medium text-black">{invoiceData.customer.name}</p>
            <p className="text-sm text-black">{invoiceData.customer.email}</p>
            {invoiceData.customer.phone && <p className="text-sm text-black">{invoiceData.customer.phone}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-black">Image</th>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-black">Item</th>
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-black">Qty</th>
                <th className="border border-gray-200 px-3 py-2 text-right text-xs font-medium text-black">Price</th>
                <th className="border border-gray-200 px-3 py-2 text-right text-xs font-medium text-black">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.line_items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-200 px-3 py-2 text-center">
                    {item.product_id && productImages[item.product_id] ? (
                      <img
                        src={productImages[item.product_id]}
                        alt={item.title}
                        className="w-8 h-8 object-cover rounded mx-auto"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded mx-auto flex items-center justify-center">
                        <span className="text-xs text-black">No Image</span>
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    <p className="text-sm font-medium text-black">{item.title}</p>
                    {item.sku && <p className="text-xs text-black">SKU: {item.sku}</p>}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center text-sm text-black">{item.quantity}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right text-sm text-black">
                    {invoiceData.currency} {item.price.toFixed(2)}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-right text-sm text-black">
                    {invoiceData.currency} {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-black">
                <span>Subtotal:</span>
                <span>{invoiceData.currency} {invoiceData.subtotal.toFixed(2)}</span>
              </div>
              {invoiceData.tax_amount > 0 && (
                <div className="flex justify-between text-sm text-black">
                  <span>Tax:</span>
                  <span>{invoiceData.currency} {invoiceData.tax_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-1 text-black">
                <span>Total:</span>
                <span>{invoiceData.currency} {invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 space-y-4">
          {invoiceData.delivery_terms && (
            <div>
              <h4 className="text-sm font-bold text-black">Delivery Terms</h4>
              <p className="text-xs text-black">{invoiceData.delivery_terms}</p>
            </div>
          )}
          
          {invoiceData.terms && (
            <div>
              <h4 className="text-sm font-bold text-black">Terms & Conditions</h4>
              <p className="text-xs text-black">{invoiceData.terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}