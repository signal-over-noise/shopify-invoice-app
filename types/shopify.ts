export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  default_address?: {
    id?: number;
    customer_id?: number;
    first_name?: string;
    last_name?: string;
    company?: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
    };
}

export interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  name: string;
  sku: string;
  quantity: number;
  price: string;
  total_discount: string;
  fulfillment_status: string | null;
}

export interface ShopifyOrder {
  id: number;
  order_number?: number; // Regular orders have this
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status?: string; // Regular orders have this
  fulfillment_status: string | null;
  customer: ShopifyCustomer | null;
  line_items: ShopifyLineItem[];
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string | null;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string | null;
  };
  // Draft order specific fields
  status?: string; // Draft orders have 'open', 'invoice_sent', 'completed'
  invoice_sent_at?: string;
  completed_at?: string;
  note?: string;
  tags?: string;
  order_type: 'regular' | 'draft'; // Custom field to distinguish
}

export interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

export interface ShopifyDraftOrdersResponse {
  draft_orders: ShopifyOrder[];
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  status: string;
  created_at: string;
  updated_at: string;
  variants: ShopifyVariant[];
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  inventory_quantity: number;
}

export interface PaginationInfo {
  hasNext: boolean;
  hasPrevious: boolean;
  nextPageInfo?: string;
  previousPageInfo?: string;
}