// app/api/shopify/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  try {

    console.log('Orders API called');
    console.log('Request URL:', request.url);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '25');
    const pageInfo = searchParams.get('page_info') || undefined;
    const orderType = searchParams.get('type') as 'all' | 'regular' | 'draft' || 'all';

    console.log('Parameters:', { limit, pageInfo, orderType });

    console.log('Fetching Shopify orders with params:', { limit, pageInfo, orderType });

    // Fetch orders from Shopify (both regular and draft)
    const result = await shopifyClient.getAllOrders(limit, pageInfo, orderType);

    console.log(`Successfully fetched ${result.orders.length} orders`);

    return NextResponse.json({
      success: true,
      orders: result.orders,
      pagination: result.pagination,
      count: result.orders.length,
      orderType
    });

  } catch (error) {
    console.error('Orders API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        orders: [],
        pagination: {
          hasNext: false,
          hasPrevious: false
        }
      },
      { status: 500 }
    );
  }
}