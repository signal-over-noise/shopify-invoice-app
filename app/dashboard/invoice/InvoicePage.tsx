"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShopifyOrder } from "@/types/shopify";
import { InvoiceData, InvoiceLineItem, InvoiceCustomer } from "@/types/invoice";
import ProductSearchDropdown from "@/components/ProductSearchDropdown";
// import PDFViewer from '@/components/PDFViewer';
import CleanPDFPreview from "@/components/CleanPDFPreview";

export default function InvoicePage() {
  const [order, setOrder] = useState<ShopifyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [productMeta, setProductMeta] = useState<Record<number, any>>({});
  const [productImages, setProductImages] = useState<Record<number, string>>(
    {}
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const orderType = searchParams.get("orderType") as "regular" | "draft";
  const [productSearchValues, setProductSearchValues] = useState<
    Record<string, string>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const extractDimensions = (title: string) => {
    // Regex patterns to match common dimension formats
    const patterns = [
      /(\d+(?:\.\d+)?cm\s*\([^)]+\))/i,  // 70cm (27.5")
      /(\d+(?:\.\d+)?"[^"]*")/i,         // 27.5"
      /(\d+(?:\.\d+)?cm)/i,              // 70cm
      /(\d+(?:\.\d+)?mm)/i,              // 100mm
      /(\d+(?:\.\d+)?m\s*\([^)]+\))/i,   // 1m (39.4")
      /(\d+(?:\.\d+)?ft)/i,              // 3ft
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const cleanTitle = (title: string) => {
    // Remove dimension patterns from title
    return title
      .replace(/\s*-\s*\d+(?:\.\d+)?cm\s*\([^)]+\)/i, '')
      .replace(/\s*-\s*\d+(?:\.\d+)?"[^"]*"/i, '')
      .replace(/\s*-\s*\d+(?:\.\d+)?cm/i, '')
      .replace(/\s*-\s*\d+(?:\.\d+)?mm/i, '')
      .replace(/\s*-\s*\d+(?:\.\d+)?m\s*\([^)]+\)/i, '')
      .replace(/\s*-\s*\d+(?:\.\d+)?ft/i, '')
      .trim();
  };

  useEffect(() => {
    if (orderId && orderType) {
      fetchOrderData();
    } else {
      initializeEmptyForm();
    }
  }, [orderId, orderType]);

  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    setErrors((prev) => ({
      ...prev,
      [context]: error.message || `Failed to ${context.toLowerCase()}`,
    }));
  };

  const clearError = (context: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[context];
      return newErrors;
    });
  };

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      clearError("fetchOrder");

      const endpoint =
        orderType === "regular"
          ? `/api/shopify/order?id=${orderId}`
          : `/api/shopify/draft-order?id=${orderId}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        await convertOrderToInvoice(data.order);
        await fetchProductImages(data.order.line_items);
      } else {
        handleError(
          new Error(data.error || "Failed to fetch order"),
          "fetchOrder"
        );
      }
    } catch (error) {
      handleError(error, "fetchOrder");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (lineItems: any[]) => {
  const imagePromises = lineItems
    .filter((item) => item.product_id)
    .map(async (item) => {
      try {
        const response = await fetch(
          `/api/shopify/product?id=${item.product_id}`
        );
        const data = await response.json();

        if (data.success) {
          return {
            productId: item.product_id,
            imageUrl: data.product.images.length > 0 ? data.product.images[0].src : null,
            meta: data.product.meta || {}
          };
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
      return null;
    });

  const imageResults = await Promise.all(imagePromises);
  const imageMap: Record<number, string> = {};
  const metaMap: Record<number, any> = {};

  imageResults.forEach((result) => {
    if (result) {
      if (result.imageUrl) {
        imageMap[result.productId] = result.imageUrl;
      }
      if (result.meta) {
        metaMap[result.productId] = result.meta;
      }
    }
  });

  setProductImages(imageMap);
  setProductMeta(metaMap); 
};

  const convertOrderToInvoice = async (orderData: ShopifyOrder) => {
  const companyDetails = await fetchShopDetails();
  const customerName = getCustomerName(orderData);
  const customerEmail = orderData.email || "No email provided";
  const totalDiscount = orderData.line_items.reduce(
    (sum, item) => sum + parseFloat(item.total_discount || "0"), 
    0
  );

  // Fetch meta information for each line item with product_id
  const lineItems: InvoiceLineItem[] = await Promise.all(
    orderData.line_items.map(async (item, index) => {
      let meta = {};
      
      if (item.product_id) {
        try {
          const response = await fetch(`/api/shopify/product?id=${item.product_id}`);
          const data = await response.json();
          if (data.success && data.product.meta) {
            meta = data.product.meta;
          }
        } catch (error) {
          console.error('Error fetching product meta:', error);
        }
      }

      const originalTitle = item.title || item.name;
      const dimensions = extractDimensions(originalTitle);
      const cleanedTitle = cleanTitle(originalTitle);
      
      if (dimensions) {
        meta = {
          ...meta,
          dimensions: dimensions
        };
      }


      return {
        id: `${item.id || index}`,
        product_id: item.product_id,
        variant_id: item.variant_id,
        title: cleanedTitle,
        sku: item.sku || "",
        quantity: item.quantity,
        price: parseFloat(item.price),
        discount: parseFloat(item.total_discount || "0"),
        total: parseFloat(item.price) * item.quantity - parseFloat(item.total_discount || "0"),
        meta: meta
      };
    })
  );

  const invoiceData: InvoiceData = {
    order_id: orderData.id,
    order_number: orderData.order_number?.toString() || orderData.name,
    order_date: orderData.created_at,

    customer: {
      name: customerName,
      email: customerEmail,
      mobile: orderData.billing_address?.phone || orderData.customer?.phone || "",
      telephone: "",
      address: extractAddress(
        orderData.shipping_address || orderData.billing_address
      ),
    },

    billing_address: extractAddress(orderData.billing_address || orderData.customer?.default_address),
    shipping_address: extractAddress(orderData.shipping_address),
    same_as_billing: !orderData.shipping_address,

    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date().toISOString().split("T")[0],
    client_reference: "",

    company: {
      name: "",
      phone: companyDetails.phone,
      address: companyDetails.address,
    },

    delivery_terms: "EXW",

    line_items: lineItems,

    subtotal: parseFloat(orderData.subtotal_price),
    tax_rate: 0,
    tax_amount: parseFloat(orderData.total_tax || "0"),
    shipping_cost: 0,
    discount_amount: totalDiscount,
    total: parseFloat(orderData.total_price),

    currency: orderData.currency,
    terms: "Payment due within 30 days",
  };

  setInvoiceData(invoiceData);
};

  const initializeEmptyForm = async () => {
    const companyDetails = await fetchShopDetails();

    const emptyInvoice: InvoiceData = {
      order_date: new Date().toISOString().split("T")[0],

      customer: {
        name: "",
        email: "",
        mobile: "",
        telephone: "",
        address: { line1: "", city: "", state: "", country: "", zip: "" },
      },

      billing_address: { line1: "", city: "", state: "", country: "", zip: "" },
      same_as_billing: true,

      invoice_number: `INV-${Date.now()}`,
      invoice_date: new Date().toISOString().split("T")[0],
      client_reference: "",

      company: companyDetails,
      delivery_terms: "EXW",

      line_items: [
        {
          id: "1",
          title: "",
          quantity: 1,
          price: 0,
          discount: 0,
          total: 0,
        },
      ],

      subtotal: 0,
      tax_rate: 0,
      tax_amount: 0,
      shipping_cost: 0,
      discount_amount: 0,
      total: 0,
      currency: "GBR",
      terms: "Payment due within 30 days",
    };

    setInvoiceData(emptyInvoice);
    setLoading(false);
  };

  const getCustomerName = (order: ShopifyOrder) => {
    if (order.customer?.first_name || order.customer?.last_name) {
      return `${order.customer.first_name || ""} ${
        order.customer.last_name || ""
      }`.trim();
    }
    if (order.customer?.id) {
      return `Customer #${order.customer.id.toString().slice(-4)}`;
    }
    return "Guest Customer";
  };

  const extractAddress = (address: any) => {
    if (!address) {
      return { line1: "", city: "", state: "", country: "", zip: "" };
    }

    return {
      line1: address.address1 || "",
      line2: address.address2 || "",
      city: address.city || "",
      state: address.province || "",
      country: address.country || "",
      zip: address.zip || "",
    };
  };

  const fetchSingleProductImage = async (
    productId: number,
    lineItemId: string
  ) => {
    try {
      const response = await fetch(`/api/shopify/product?id=${productId}`);
      const data = await response.json();

      if (data.success && data.product.images.length > 0) {
        setProductImages((prev) => ({
          ...prev,
          [productId]: data.product.images[0].src,
        }));
      }
    } catch (error) {
      console.error("Error fetching product image:", error);
    }
  };

  const fetchShopDetails = async () => {
    try {
      const response = await fetch("/api/shopify/shop");
      const data = await response.json();

      if (data.success) {
        return {
          name: data.shop.name || "",
          phone: data.shop.phone || "+44 123 456 7890",
          address: {
            line1: data.shop.address.line1 || "123 Business Street",
            line2: data.shop.address.line2 || "",
            city: data.shop.address.city || "London",
            state: data.shop.address.state || "England",
            country: data.shop.address.country || "United Kingdom",
            zip: data.shop.address.zip || "SW1A 1AA",
          },
        };
      }
    } catch (error) {
      console.error("Error fetching shop details:", error);
    }

    return {
      name: "Your Company Name",
      phone: "+44 123 456 7890",
      address: {
        line1: "123 Business Street",
        line2: "",
        city: "London",
        state: "England",
        country: "United Kingdom",
        zip: "SW1A 1AA",
      },
    };
  };

  const updateInvoiceData = (field: keyof InvoiceData, value: any) => {
    setInvoiceData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const updateLineItem = (
    index: number,
    field: keyof InvoiceLineItem,
    value: any
  ) => {
    if (!invoiceData) return;

    const newLineItems = [...invoiceData.line_items];
    newLineItems[index] = { ...newLineItems[index], [field]: value };

    if (field === "quantity" || field === "price" || field === "discount") {
      const item = newLineItems[index];
      item.total = item.quantity * item.price - item.discount;
    }

    const subtotal = newLineItems.reduce((sum, item) => sum + item.total, 0);
    const total =
      subtotal +
      invoiceData.tax_amount +
      invoiceData.shipping_cost -
      invoiceData.discount_amount;

    setInvoiceData({
      ...invoiceData,
      line_items: newLineItems,
      subtotal,
      total,
    });
  };

  const addLineItem = () => {
    if (!invoiceData) return;

    const newItem: InvoiceLineItem = {
      id: Date.now().toString(),
      title: "",
      quantity: 1,
      price: 0,
      discount: 0,
      total: 0,
    };

    setInvoiceData({
      ...invoiceData,
      line_items: [...invoiceData.line_items, newItem],
    });
  };

  const removeLineItem = (index: number) => {
    if (!invoiceData || invoiceData.line_items.length <= 1) return;

    const newLineItems = invoiceData.line_items.filter((_, i) => i !== index);
    const subtotal = newLineItems.reduce((sum, item) => sum + item.total, 0);
    const total =
      subtotal +
      invoiceData.tax_amount +
      invoiceData.shipping_cost -
      invoiceData.discount_amount;

    setInvoiceData({
      ...invoiceData,
      line_items: newLineItems,
      subtotal,
      total,
    });
  };

  const generateInvoice = async () => {
    if (!invoiceData) return;

    try {
      setSaveStatus("saving");
      clearError("generatePDF");

      const { pdf } = await import("@react-pdf/renderer");
      const { Atelier001PDFTemplate } = await import("@/components/InvoicePDFTemplate");
      const React = await import("react");

      const validation = validateInvoiceData(invoiceData);
      if (!validation.isValid) {
        handleError(
          new Error(`Invalid invoice data: ${validation.errors.join(", ")}`),
          "generatePDF"
        );
        setSaveStatus("error");
        return;
      }

      const invoiceDataWithImages = await prepareInvoiceDataForPDF(invoiceData);

      const pdfDocument: any = React.createElement(Atelier001PDFTemplate, {
        invoiceData: invoiceDataWithImages,
      });
      const blob = await pdf(pdfDocument).toBlob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${invoiceData.invoice_number.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("PDF generation error:", error);
      handleError(error, "generatePDF");
      setSaveStatus("error");
    }
  };

  const validateInvoiceData = (
    data: InvoiceData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.invoice_number?.trim()) errors.push("Invoice number is required");
    if (!data.invoice_date) errors.push("Invoice date is required");
    if (!data.customer.name?.trim()) errors.push("Customer name is required");
    if (!data.customer.email?.trim()) errors.push("Customer email is required");
    if (!data.company.name?.trim()) errors.push("Company name is required");

    if (!data.line_items.length) {
      errors.push("At least one line item is required");
    } else {
      const invalidItems = data.line_items.filter(
        (item) => !item.title?.trim() || item.quantity <= 0 || item.price < 0
      );
      if (invalidItems.length > 0) {
        errors.push(
          "All items must have a title, positive quantity, and non-negative price"
        );
      }
    }

    if (data.total < 0) errors.push("Total amount cannot be negative");

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const prepareInvoiceDataForPDF = async (
    data: InvoiceData
  ): Promise<InvoiceData> => {
    const logoBase64 = await convertImageToBase64('/logo.png');
    const lineItemsWithImages = await Promise.all(
      data.line_items.map(async (item) => {
        let processedItem = { ...item };
        
        // Handle image conversion
        if (item.product_id && productImages[item.product_id]) {
          const base64Image = await convertImageToBase64(
            productImages[item.product_id]
          );
          processedItem.image_url = base64Image || undefined;
        }
        
        // Extract dimensions from title and clean it
        const dimensions = extractDimensions(item.title);
        const cleanedTitle = cleanTitle(item.title);
        
        // Update title
        processedItem.title = cleanedTitle;
        
        // Add dimensions to meta if found
        if (dimensions && item.meta) {
          processedItem.meta = {
            ...item.meta,
            dimensions: dimensions
          };
        } else if (dimensions) {
          processedItem.meta = {
            dimensions: dimensions
          };
        }
        
        return processedItem;
      })
    );

    return {
      ...data,
      line_items: lineItemsWithImages,
      logoBase64: logoBase64,
    };
  };

  const convertImageToBase64 = async (
    imageUrl: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900 mx-auto"></div>
          <p className="mt-2 text-slate-600 text-sm">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading invoice data</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Create Invoice
                </h1>
                <p className="text-sm text-slate-600">
                  {order
                    ? `From Order ${invoiceData.order_number}`
                    : "Custom Invoice"}
                </p>
              </div>
            </div>
            <button
              onClick={generateInvoice}
              disabled={saveStatus === "saving"}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                saveStatus === "saving"
                  ? "bg-slate-400 text-white cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {saveStatus === "saving" ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>
      </header>

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-red-50 border-b border-red-200">
          {Object.entries(errors).map(([context, message]) => (
            <div
              key={context}
              className="flex items-center justify-between mb-2 last:mb-0"
            >
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm text-red-800">{message}</p>
              </div>
              <button
                onClick={() => clearError(context)}
                className="text-red-400 hover:text-red-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Form Side - Left */}
        <div className="w-full lg:w-1/2 overflow-y-auto border-r border-slate-200">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">
                  Invoice Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoiceData.invoice_number}
                      onChange={(e) =>
                        updateInvoiceData("invoice_number", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={invoiceData.invoice_date}
                      onChange={(e) =>
                        updateInvoiceData("invoice_date", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Client Reference
                    </label>
                    <input
                      type="text"
                      value={invoiceData.client_reference || ""}
                      onChange={(e) =>
                        updateInvoiceData("client_reference", e.target.value)
                      }
                      placeholder="Client PO number or reference"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={invoiceData.customer.name}
                      onChange={(e) =>
                        updateInvoiceData("customer", {
                          ...invoiceData.customer,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={invoiceData.customer.email}
                      onChange={(e) =>
                        updateInvoiceData("customer", {
                          ...invoiceData.customer,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Telephone
                    </label>
                    <input
                      type="tel"
                      value={invoiceData.customer.telephone || ""}
                      onChange={(e) =>
                        updateInvoiceData("customer", {
                          ...invoiceData.customer,
                          telephone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      value={invoiceData.customer.mobile || ""}
                      onChange={(e) =>
                        updateInvoiceData("customer", {
                          ...invoiceData.customer,
                          mobile: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">
                  Company Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={invoiceData.company.name}
                      onChange={(e) =>
                        updateInvoiceData("company", {
                          ...invoiceData.company,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={invoiceData.billing_address.line1}
                      onChange={(e) =>
                        updateInvoiceData("billing_address", {
                          ...invoiceData.billing_address,
                          line1: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={invoiceData.billing_address.line2 || ""}
                      onChange={(e) =>
                        updateInvoiceData("billing_address", {
                          ...invoiceData.billing_address,
                          line2: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={invoiceData.billing_address.city}
                      onChange={(e) =>
                        updateInvoiceData("billing_address", {
                          ...invoiceData.billing_address,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={invoiceData.billing_address.zip}
                      onChange={(e) =>
                        updateInvoiceData("billing_address", {
                          ...invoiceData.billing_address,
                          zip: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={invoiceData.billing_address.country}
                      onChange={(e) =>
                        updateInvoiceData("billing_address", {
                          ...invoiceData.billing_address,
                          country: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Terms */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Delivery Terms
                </label>
                <textarea
                  value={invoiceData.delivery_terms || ""}
                  onChange={(e) =>
                    updateInvoiceData("delivery_terms", e.target.value)
                  }
                  rows={3}
                  placeholder="Delivery terms and conditions"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                />
              </div>

              {/* Line Items */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Items</h2>
                  <button
                    onClick={addLineItem}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-2 rounded-md text-sm transition-colors"
                  >
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {invoiceData.line_items.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        {item.product_id && productImages[item.product_id] && (
                          <img
                            src={productImages[item.product_id]}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded border border-slate-200"
                          />
                        )}
                        <div className="flex-1">
                          <ProductSearchDropdown
                            value={productSearchValues[item.id] || item.title}
                            onChange={(value) => {
                              setProductSearchValues((prev) => ({
                                ...prev,
                                [item.id]: value,
                              }));
                            }}
                            onSelectProduct={async (product, variant) => {
                              const price = parseFloat(variant.price);
                              const quantity = item.quantity;
                              const discount = item.discount;
                              const total = quantity * price - discount;

                              const fullTitle = `${product.title} - ${variant.title}`;
                              const dimensions = extractDimensions(fullTitle);
                              const cleanedTitle = cleanTitle(fullTitle);

                              // Fetch meta information for the selected product
                              let meta = {};
                              try {
                                const response = await fetch(`/api/shopify/product?id=${product.id}`);
                                const data = await response.json();
                                if (data.success && data.product.meta) {
                                  meta = data.product.meta;
                                }
                                if (dimensions) {
                                  meta = {
                                    ...meta,
                                    dimensions: dimensions
                                  };
                                }
                              } catch (error) {
                                console.error('Error fetching product meta:', error);
                              }

                              setInvoiceData((prevData) => {
                                if (!prevData) return prevData;

                                const newLineItems = prevData.line_items.map(
                                  (lineItem, i) => {
                                    if (i === index) {
                                      return {
                                        ...lineItem,
                                        product_id: product.id,
                                        variant_id: variant.id,
                                        title: cleanedTitle,
                                        sku: variant.sku || "",
                                        price: price,
                                        total: total,
                                        meta: meta, // Add the fetched meta information
                                      };
                                    }
                                    return lineItem;
                                  }
                                );

                                const subtotal = newLineItems.reduce(
                                  (sum, lineItem) => sum + lineItem.total,
                                  0
                                );
                                const newTotal =
                                  subtotal +
                                  prevData.tax_amount +
                                  prevData.shipping_cost -
                                  prevData.discount_amount;

                                return {
                                  ...prevData,
                                  line_items: newLineItems,
                                  subtotal,
                                  total: newTotal,
                                };
                              });

                              setProductSearchValues((prev) => ({
                                ...prev,
                                [item.id]: cleanedTitle,
                              }));

                              fetchSingleProductImage(product.id, item.id);
                            }}
                            placeholder="Search products..."
                          />
                        </div>
                        {invoiceData.line_items.length > 1 && (
                          <button
                            onClick={() => removeLineItem(index)}
                            className="text-red-400 hover:text-red-600 p-1 mt-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Price
                          </label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Total
                          </label>
                          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-medium">
                            {invoiceData.currency} {item.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">Discount</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Trade Discount Amount
                    </label>
                    <input
                      type="number"
                      value={invoiceData.discount_amount}
                      onChange={(e) => {
                        const discountAmount = parseFloat(e.target.value) || 0;
                        
                        // Validate discount doesn't exceed subtotal
                        const maxDiscount = invoiceData.subtotal;
                        const validDiscount = Math.min(discountAmount, maxDiscount);
                        
                        const newTotal = invoiceData.subtotal + invoiceData.tax_amount + invoiceData.shipping_cost - validDiscount;
                        
                        setInvoiceData({
                          ...invoiceData,
                          discount_amount: validDiscount,
                          total: newTotal,
                        });
                      }}
                      min="0"
                      max={invoiceData.subtotal}
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Discount Percentage
                    </label>
                    <input
                      type="number"
                      value={invoiceData.subtotal > 0 
                        ? ((invoiceData.discount_amount / invoiceData.subtotal) * 100).toFixed(1)
                        : "0"
                      }
                      onChange={(e) => {
                        const percentage = parseFloat(e.target.value) || 0;
                        
                        // Validate percentage doesn't exceed 100%
                        const validPercentage = Math.min(percentage, 100);
                        
                        const discountAmount = invoiceData.subtotal > 0 
                          ? (invoiceData.subtotal * validPercentage) / 100 
                          : 0;
                        
                        const newTotal = invoiceData.subtotal + invoiceData.tax_amount + invoiceData.shipping_cost - discountAmount;
                        
                        setInvoiceData({
                          ...invoiceData,
                          discount_amount: discountAmount,
                          total: newTotal,
                        });
                      }}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
                    />
                    <span className="text-xs text-slate-500 mt-1">Max 100%</span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium text-slate-900">
                      {invoiceData.currency} {invoiceData.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {invoiceData.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Trade Discount ({((invoiceData.discount_amount / invoiceData.subtotal) * 100).toFixed(1)}%):
                      </span>
                      <span className="font-medium text-slate-900">
                        - {invoiceData.currency} {invoiceData.discount_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax:</span>
                    <span className="font-medium text-slate-900">
                      {invoiceData.currency} {invoiceData.tax_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold text-slate-900 text-lg">Total:</span>
                    <span className="font-bold text-lg text-slate-900">
                      {invoiceData.currency} {invoiceData.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Preview Side - Right */}
        <div className="w-full lg:w-1/2 bg-white overflow-hidden">
          <div className="h-full bg-white">
            <CleanPDFPreview
              invoiceData={invoiceData}
              productImages={productImages}
              productMeta={productMeta}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
