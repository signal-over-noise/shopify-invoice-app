// lib/shopify.ts
import { ShopifyOrder, ShopifyOrdersResponse, ShopifyDraftOrdersResponse, ShopifyProduct, PaginationInfo } from '@/types/shopify';

class ShopifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    const storeUrl = process.env.SHOPIFY_STORE_URL;
    this.accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN!;
    
    // Clean up the store URL to get the proper format
    if (!storeUrl) {
      throw new Error('SHOPIFY_STORE_URL is required');
    }
    
    // Extract store name from URL if full URL is provided
    const storeMatch = storeUrl.match(/https?:\/\/([^.]+)\.myshopify\.com/);
    const storeName = storeMatch ? storeMatch[1] : storeUrl.replace(/https?:\/\//, '').replace('.myshopify.com/', '');
    
    this.baseUrl = `https://${storeName}.myshopify.com/admin/api/2023-10`;
    
    if (!this.accessToken) {
      throw new Error('SHOPIFY_ADMIN_API_TOKEN is required');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Shopify API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: error,
        url: url
      });
      throw new Error(`Shopify API Error: ${response.status} - ${response.statusText}`);
    }

    // Parse pagination info from Link header
    const linkHeader = response.headers.get('Link');
    let pagination: PaginationInfo = {
      hasNext: false,
      hasPrevious: false
    };

    if (linkHeader) {
      const links = linkHeader.split(',');
      for (const link of links) {
        const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
        if (match) {
          const [, url, rel] = match;
          const pageInfo = new URL(url).searchParams.get('page_info');
          if (rel === 'next' && pageInfo) {
            pagination.hasNext = true;
            pagination.nextPageInfo = pageInfo;
          } else if (rel === 'previous' && pageInfo) {
            pagination.hasPrevious = true;
            pagination.previousPageInfo = pageInfo;
          }
        }
      }
    }

    const data = await response.json();
    return { data, pagination };
  }

  async getOrders(limit = 50, status = 'any', pageInfo?: string): Promise<{orders: ShopifyOrder[], pagination: PaginationInfo}> {
    try {
      let endpoint = `/orders.json?limit=${limit}&status=${status}&fields=id,order_number,name,email,created_at,updated_at,total_price,subtotal_price,total_tax,currency,financial_status,fulfillment_status,customer,line_items,shipping_address,billing_address`;
      
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const { data, pagination }: { data: ShopifyOrdersResponse, pagination: PaginationInfo } = await this.makeRequest(endpoint);
      
      // Mark as regular orders
      const orders = (data.orders || []).map(order => ({
        ...order,
        order_type: 'regular' as const
      }));

      return { orders, pagination };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getDraftOrders(limit = 50, pageInfo?: string): Promise<{orders: ShopifyOrder[], pagination: PaginationInfo}> {
    try {
      let endpoint = `/draft_orders.json?limit=${limit}`;
      
      // Don't limit fields initially to see what we get
      // endpoint += `&fields=id,name,email,created_at,updated_at,total_price,subtotal_price,total_tax,currency,status,customer,line_items,shipping_address,billing_address,invoice_sent_at,completed_at,note,tags`;
      
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const { data, pagination }: { data: ShopifyDraftOrdersResponse, pagination: PaginationInfo } = await this.makeRequest(endpoint);
      
      // Mark as draft orders and normalize the structure
      const orders = (data.draft_orders || []).map(order => ({
        ...order,
        order_type: 'draft' as const,
        financial_status: order.status === 'completed' ? 'paid' : 'pending', // Map draft status to financial status
        order_number: undefined // Draft orders don't have order numbers
      }));

      return { orders, pagination };
    } catch (error) {
      console.error('Error fetching draft orders:', error);
      throw error;
    }
  }

  async getAllOrders(limit = 25, pageInfo?: string, orderType: 'all' | 'regular' | 'draft' = 'all'): Promise<{orders: ShopifyOrder[], pagination: PaginationInfo}> {
    try {
      if (orderType === 'regular') {
        return await this.getOrders(limit, 'any', pageInfo);
      } else if (orderType === 'draft') {
        return await this.getDraftOrders(limit, pageInfo);
      }

      // Fetch both types and combine them
      const [regularResult, draftResult] = await Promise.all([
        this.getOrders(Math.ceil(limit / 2), 'any').catch(() => ({ orders: [], pagination: { hasNext: false, hasPrevious: false } })),
        this.getDraftOrders(Math.ceil(limit / 2)).catch(() => ({ orders: [], pagination: { hasNext: false, hasPrevious: false } }))
      ]);

      // Combine and sort by created date (newest first)
      const allOrders = [...regularResult.orders, ...draftResult.orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);

      // For combined results, pagination is more complex - we'll simplify it
      const combinedPagination: PaginationInfo = {
        hasNext: regularResult.pagination.hasNext || draftResult.pagination.hasNext,
        hasPrevious: regularResult.pagination.hasPrevious || draftResult.pagination.hasPrevious,
      };

      return { orders: allOrders, pagination: combinedPagination };
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  async getOrder(orderId: number): Promise<ShopifyOrder> {
    try {
      const response = await this.makeRequest(`/orders/${orderId}.json`);
      return {
        ...response.data.order,
        order_type: 'regular' as const
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getDraftOrder(draftOrderId: number): Promise<ShopifyOrder> {
    try {
      const response = await this.makeRequest(`/draft_orders/${draftOrderId}.json`);
      return {
        ...response.data.draft_order,
        order_type: 'draft' as const,
        financial_status: response.data.draft_order.status === 'completed' ? 'paid' : 'pending'
      };
    } catch (error) {
      console.error('Error fetching draft order:', error);
      throw error;
    }
  }

  async getProduct(productId: number): Promise<any> {
    try {
      const { data } = await this.makeRequest(`/products/${productId}.json`);
      return data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getProducts(limit = 50): Promise<ShopifyProduct[]> {
    try {
      const { data } = await this.makeRequest(
        `/products.json?limit=${limit}&fields=id,title,handle,status,created_at,updated_at,variants`
      );
      
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Test connection to Shopify
  async testConnection(): Promise<{ success: boolean; store?: any; error?: string }> {
    try {
      const { data } = await this.makeRequest('/shop.json');
      return { 
        success: true, 
        store: {
          name: data.shop.name,
          domain: data.shop.domain,
          email: data.shop.email
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getCustomer(customerId: number): Promise<any> {
  try {
    const { data } = await this.makeRequest(`/customers/${customerId}.json`);
    return data.customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

  async searchProducts(query: string, limit = 20): Promise<ShopifyProduct[]> {
    try {
      // Use GraphQL for better search capabilities
      const graphqlQuery = `
        query searchProducts($query: String!, $first: Int!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                handle
                status
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(`${this.baseUrl.replace('/admin/api/2023-10', '')}/admin/api/2023-10/graphql.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: {
            query: `title:*${query}* OR title:${query}*`,
            first: limit
          }
        })
      });

      if (!response.ok) {
        throw new Error('GraphQL request failed');
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const products = data.data.products.edges.map((edge: any) => ({
        id: parseInt(edge.node.id.split('/').pop()),
        title: edge.node.title,
        handle: edge.node.handle,
        status: edge.node.status,
        variants: edge.node.variants.edges.map((variantEdge: any) => ({
          id: parseInt(variantEdge.node.id.split('/').pop()),
          title: variantEdge.node.title,
          price: variantEdge.node.price,
          sku: variantEdge.node.sku
        }))
      }));

      return products;
    } catch (error) {
      console.error('GraphQL search failed, falling back to REST:', error);
      
      // Fallback: Get all products and filter client-side
      try {
        const { data } = await this.makeRequest(
          `/products.json?limit=250&fields=id,title,handle,variants`
        );
        
        const allProducts = data.products || [];
        const filteredProducts = allProducts.filter((product: any) => 
          product.title.toLowerCase().includes(query.toLowerCase())
        );
        
        return filteredProducts.slice(0, limit);
      } catch (fallbackError) {
        console.error('Fallback search failed:', fallbackError);
        return [];
      }
    }
  }
  
  async getShopDetails(): Promise<{ success: boolean; shop?: any; error?: string }> {
  try {
    const { data } = await this.makeRequest('/shop.json');
    return { 
      success: true, 
      shop: data.shop
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

}

export const shopifyClient = new ShopifyClient();