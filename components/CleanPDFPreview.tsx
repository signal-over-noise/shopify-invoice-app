"use client";

import { InvoiceData } from "@/types/invoice";
import React from "react";

interface Atelier001PreviewProps {
  invoiceData: InvoiceData;
  productImages: Record<number, string>;
  productMeta: Record<number, any>;
}

export default function InvoicePDFTemplate({
  invoiceData,
  productImages,
}: Atelier001PreviewProps) {

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  
    const getCurrencySymbol = (currencyCode: string): string => {
    const currencyMap: Record<string, string> = {
      'GBP': '£',
      'USD': '$',
      'EUR': '€',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'INR': '₹',
      'CNY': '¥',
      'KRW': '₩',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NZD': 'NZ$',
      'ZAR': 'R',
      'BRL': 'R$',
      'MXN': '$',
      'RUB': '₽',
    };
    
    return currencyMap[currencyCode.toUpperCase()] || currencyCode;
  };

  console.log("🚀 ~ Atelier001Preview ~ invoiceData:", invoiceData);

  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div
        className="max-w-full mx-auto bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        {/* PAGE 01 - INVOICE */}
        <div
          style={{
            padding: "40px 50px 25px 50px",
            fontFamily: "Julius Sans One, sans-serif",
            letterSpacing: "1px",
            lineHeight: "1.8",
            color: "#4D4D4D",
            fontSize: "14px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "3.5em",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "130px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontWeight: 400,
                  fontSize: "1.5rem",
                  letterSpacing: "2px",
                  lineHeight: "1.2",
                }}
              >
                <img src="/logo.png" alt="" />
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: "10px",
                color: "#AAA",
                marginLeft: "auto",
              }}
            >
              PAGE 01 | 03
            </div>
          </div>
          {/* Top Info Section */}
          <div
            style={{
              width: "100%",
              lineHeight: "1.4",
              fontSize: "11px",
              marginTop: "1.5rem",
              marginBottom: "2.5rem",
              paddingLeft: "30px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "70px" }}>
              <tbody>
                      <tr style={{ width: "100%"}}>
                        <th
                          style={{
                            textAlign: "left",
                            fontSize: "1rem",
                            fontWeight: 400,
                            marginBottom: "1.0em",
                            letterSpacing: "0.5px",
                            paddingBottom: "15px",
                            color: "#000",
                          }}
                        >
                          PRO FORMA INVOICE 
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            fontSize: "1rem",
                            fontWeight: 400,
                            marginBottom: "1.0em",
                            letterSpacing: "0.5px",
                            paddingBottom: "15px",
                            color: "#000",
                          }}
                        >
                          RE{invoiceData.invoice_number}
                        </th>
                      </tr>
                      
                      <tr>
                        <td
                        style={{
                          width: "50%",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingTop: "4px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}>
                          ISSUE DATE
                        </td>
                        <td>
                          {new Date(invoiceData.invoice_date).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                        style={{
                          width: "50%",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingTop: "4px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}>
                          CLIENT REFERENCE
                        </td>
                        <td>
                          {invoiceData.client_reference || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td
                        style={{
                          width: "50%",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingTop: "4px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}>
                          DELIVERY TERMS
                        </td>
                        <td>
                          {invoiceData.delivery_terms || "EXW"}
                        </td>
                      </tr>
                      <tr>
                        <td
                        style={{
                          width: "50%",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingTop: "4px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          verticalAlign: "top"
                        }}>
                          COMPANY DETAILS
                        </td>
                        <td>
                            {invoiceData.billing_address?.line1 && (
                              <>
                                {invoiceData.billing_address.line1}
                                <br />
                              </>
                            )}
                            {invoiceData.billing_address?.line2 && (
                              <>
                                {invoiceData.billing_address.line2}
                                <br />
                              </>
                            )}
                            {invoiceData.billing_address?.city && (
                              <>
                                {invoiceData.billing_address.city}
                                <br />
                              </>
                            )}
                            {invoiceData.billing_address?.zip && (
                              <>
                                {invoiceData.billing_address.zip}
                                <br />
                              </>
                            )}
                            {invoiceData.billing_address?.country && invoiceData.billing_address.country}
                        </td>
                      </tr>
                      <tr>
                        <td
                        style={{
                          width: "50%",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingTop: "4px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}>
                          CONTACT
                        </td>
                        <td>
                          {invoiceData.customer.name}
                        </td>
                      </tr>
                      <tr>
                        <td
                        style={{
                          width: "50%",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingTop: "4px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}>
                          EMAIL
                        </td>
                        <td>
                          {invoiceData.customer.email}
                        </td>
                      </tr>
                      <tr>
                        <td
                        style={{
                          width: "50%",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingTop: "4px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}>
                         PHONE
                        </td>
                        <td>
                          {[
                            invoiceData.customer.telephone && `T ${invoiceData.customer.telephone}`,
                            invoiceData.customer.mobile && `M ${invoiceData.customer.mobile}`
                          ].filter(Boolean).join(' / ') || "N/A"}
                        </td>
                      </tr>
              </tbody>
          </table>
          </div>

          {/* Line Items */}

          <div
            style={{
              width: "100%",
              paddingLeft: "30px",
              marginBottom: "1.5rem",
              marginTop: "3.5rem",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      width: "50%",
                      textAlign: "left",
                      color: "#777",
                      fontWeight: 400,
                      fontSize: "11px",
                    }}
                  >
                    ITEM DETAILS
                  </th>
                  <th
                    style={{
                      width: "25%",
                      textAlign: "left",
                      color: "#777",
                      fontWeight: 400,
                      fontSize: "11px",
                    }}
                  >
                    PRICE PER ITEM
                  </th>
                  <th
                    style={{
                      width: "25%",
                      textAlign: "left",
                      color: "#777",
                      fontWeight: 400,
                      fontSize: "11px",
                    }}
                  >
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.line_items.map((item, index) => {
                  return (
                    <React.Fragment key={`item-${index}`}>
                      <tr key={`qty-${index}`} style={{ marginTop: "15px" }}>
                        <td
                          style={{
                            width: "50%",
                            textAlign: "left",
                            color: "#777",
                            fontWeight: 400,
                            fontSize: "11px",
                            paddingTop: "5px",
                          }}
                        >
                          QTY {item.quantity}
                        </td>
                      </tr>
                      <tr key={`details-${index}`}>
                        <td
                          style={{
                            width: "50%",
                            textAlign: "left",
                            color: "#777",
                            fontWeight: 400,
                            fontSize: "11px",
                            paddingBottom: "20px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "10px",
                            }}
                          >
                            {item.product_id &&
                            productImages[item.product_id] ? (
                              <img
                                src={productImages[item.product_id]}
                                alt={item.title}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  backgroundColor: "#F5F5F5",
                                  borderRadius: "4px",
                                  display: "block",
                                }}
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: 500, fontSize: "14px" }}>
                                {item.title}
                              </div>
                              {item.meta && Object.keys(item.meta).some(key => item.meta![key as keyof typeof item.meta]) && (
                                <div style={{ 
                                  fontSize: "11px", 
                                  color: "#999", 
                                  lineHeight: "1.4",
                                  fontWeight: 400,
                                  paddingRight: "80px"
                                }}>
                                  {[
                                    item.meta.collection,
                                    item.meta.category,
                                    item.meta.product_type,
                                    item.meta.finishes,
                                    item.meta.dimensions
                                  ].filter(Boolean).join(' | ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            width: "25%",
                            textAlign: "left",
                            color: "#777",
                            fontWeight: 400,
                            fontSize: "11px",
                            verticalAlign: "top",
                          }}
                        >
                          {getCurrencySymbol(invoiceData.currency)} {formatCurrency(item.price)}
                        </td>
                        <td
                          style={{
                            width: "25%",
                            textAlign: "left",
                            color: "#777",
                            fontWeight: 400,
                            fontSize: "11px",
                            verticalAlign: "top",
                          }}
                        >
                          {getCurrencySymbol(invoiceData.currency)} {formatCurrency(item.total)}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
                <tr>
                  <td></td>
                  <td style={{
                            width: "25%",
                            textAlign: "left",
                            color: "#777",
                            fontWeight: 400,
                            fontSize: "11px",
                          }}>SUBTOTAL</td>
                  <td style={{
                            width: "25%",
                            textAlign: "left",
                            color: "#777",
                            fontWeight: 400,
                            fontSize: "11px",
                            verticalAlign: "top",
                          }}>{getCurrencySymbol(invoiceData.currency)} {formatCurrency(invoiceData.subtotal)}</td>
                </tr>
                <tr>
                  <td></td>
                  <td 
                    style={{
                            width: "25%",
                            textAlign: "left",
                            color: "#777",
                            fontWeight: 400,
                            fontSize: "11px",
                          }}
                  >Trade Discount{" "}
                  {(
                    (invoiceData.discount_amount / invoiceData.subtotal) *
                    100
                  ).toFixed(0)}
                  % </td>
                  <td style={{
                    width: "25%",
                    textAlign: "left",
                    color: "#777",
                    fontWeight: 400,
                    fontSize: "11px",
                    position: "relative",
                  }}>
                    <div style={{ position: "absolute", left: -8, top: 0 }}>- </div> 
                  {getCurrencySymbol(invoiceData.currency)}{" "}
                  {formatCurrency(invoiceData.discount_amount)}
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td style={{ paddingTop: "15px", color: "black", fontSize: "14px" }}>TOTAL EX VAT</td>
                  <td style={{ paddingTop: "15px", color: "black", fontSize: "14px" }}>{getCurrencySymbol(invoiceData.currency)} {formatCurrency(invoiceData.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div
            style={{
              marginTop: "2.5rem",
              lineHeight: "1.4",
              paddingLeft: "30px",
              marginBottom: "2.5rem",
              fontSize: "12px",
              color: "#777",
              fontWeight: 400,
            }}
          >
            <p>
              A 100% advance payment is required to confirm the order. The lead
              time is 14–18 weeks from receipt of payment. Please review our
              terms and conditions overleaf.
            </p>
            <p style={{ marginTop: "1.2rem", marginBottom: "1.2rem" }}>
              All the aforementioned costs are required to be settled via bank
              transfer. Please find the following bank details for the GBP
              payment:
            </p>

            <div style={{ width: "100%", fontSize: "11px", marginTop: "1rem" }}>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "50%", paddingTop: "3px"}}>BANK NAME</td>
                    <td style={{ width: "50%", paddingTop: "3px"}}>HSBC UK BANK PLC</td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%", paddingTop: "3px"}}>BANK ADDRESS</td>
                    <td style={{ width: "50%", paddingTop: "3px"}}>PO Box 1EZ 196 Oxford Street, London W1D 1NT, UK</td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%", paddingTop: "3px"}}>IBAN</td>
                    <td style={{ width: "50%", paddingTop: "3px"}}>GB36 HBUK 4005 1662 7431 08</td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%", paddingTop: "3px"}}>SWIFT</td>
                    <td style={{ width: "50%", paddingTop: "3px"}}>HBUKGB4B</td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%", paddingTop: "3px"}}>ACCOUNT NO</td>
                    <td style={{ width: "50%", paddingTop: "3px"}}>Atelier001 Ltd</td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%", paddingTop: "3px"}}>SORT CODE</td>
                    <td style={{ width: "50%", paddingTop: "3px"}}>40-05-16</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "3.5em",
              position: "relative",
              marginTop: "100px",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontWeight: 400,
                  fontSize: "1.5rem",
                  letterSpacing: "2px",
                  lineHeight: "1.2",
                }}
              >
                <div style={{ textAlign: "center", fontSize: "10px", color: "#777", marginTop: "5rem"}}>
                  <p>ATELIER001 | UNIT 102 BUSPACE STUDIOS | CONLAN STREET | LONDON W10 5AP | UK</p>
                  <p>INFO@ATELIER001.COM | T +44(0)2037780858 | REG11953781 | VAT 334486000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
