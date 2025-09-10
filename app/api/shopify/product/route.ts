// app/api/shopify/product/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await shopifyClient.getProduct(parseInt(productId));
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const metaobjects = await shopifyClient.getProductMetaobjects(productId);

    // Extract specific metafields using correct field names
    const productMeta = {
      collection: '',
      category: '',
      product_type: '',
      finishes: ''
    };

    metaobjects.forEach((meta: any) => {
      const key = meta?.key;
      
      // Use exact field names from Shopify
      if (key === 'collections') {
        // Parse JSON array and take first value
        try {
          const collections = JSON.parse(meta.value);
          productMeta.collection = collections[0] || '';
        } catch {
          productMeta.collection = meta.value;
        }
      }
      
      if (key === 'product_category') {
        productMeta.category = meta.value || '';
      }
      
      if (key === 'categorys') {
        // Parse JSON array and take first value for product type
        try {
          const categories = JSON.parse(meta.value);
          productMeta.product_type = categories[0] || '';
        } catch {
          productMeta.product_type = meta.value;
        }
      }
      
      if (key === 'finishs') {
        // Parse JSON array and take first value
        try {
          const finishes = JSON.parse(meta.value);
          productMeta.finishes = finishes[0] || '';
        } catch {
          productMeta.finishes = meta.value;
        }
      }
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        title: product.title,
        images: product.images || [],
        variants: product.variants || [],
        meta: productMeta
      }
    });

  } catch (error: unknown) {
    console.error('Product API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
