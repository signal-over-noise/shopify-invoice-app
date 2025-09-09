export interface InvoiceLineItem {
  id: string;
  product_id?: number;
  variant_id?: number;
  title: string;
  sku?: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  image_url?: string;
}

export interface InvoiceCustomer {
  name: string;
  email: string;
  mobile?: string;
  telephone?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
}

export interface InvoiceData {
  // Order Information
  order_id?: number;
  order_number?: string;
  order_date: string;
  
  // Customer Information
  customer: InvoiceCustomer;
  
  // Billing & Shipping
  billing_address: InvoiceCustomer['address'];
  shipping_address?: InvoiceCustomer['address'];
  same_as_billing: boolean;
  
  // Invoice Details
  invoice_number: string;
  invoice_date: string;
  client_reference?: string;

  company: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    phone: string;
  };

  delivery_terms?: string;
  
  // Line Items
  line_items: InvoiceLineItem[];
  
  // Financial
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  
  // Additional Info
  terms?: string;
  currency: string;
}