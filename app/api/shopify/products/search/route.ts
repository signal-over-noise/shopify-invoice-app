import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        products: []
      });
    }

    const products = await shopifyClient.searchProducts(query, limit);

    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        id: product.id,
        title: product.title,
        variants: product.variants.map(variant => ({
          id: variant.id,
          title: variant.title,
          price: variant.price,
          sku: variant.sku
        }))
      }))
    });

  } catch (error) {
    console.error('Product search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search products' },
      { status: 500 }
    );
  }
}