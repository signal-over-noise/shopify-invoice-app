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

    // Get basic product data
    const product = await shopifyClient.getProduct(parseInt(productId));

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get metaobjects using GraphQL
    const metaobjects = await shopifyClient.getProductMetaobjects(productId);

    const technicalInfo = metaobjects.find((meta: any) => meta?.key === 'technical_information_s');
    console.log("🚀 ~ GET ~ technicalInfo:", technicalInfo);

    let technicalData = null;
    if (technicalInfo?.value) {
      try {
        // Parse the metaobject reference IDs from the value
        const metaobjectIds = JSON.parse(technicalInfo.value);

        // Fetch the actual metaobject data for the first ID
        if (metaobjectIds.length > 0) {
          technicalData = await shopifyClient.getMetaobjectData(metaobjectIds[0]);
          console.log("🚀 ~ GET ~ technicalData:", technicalData);
        }
      } catch (parseError) {
        console.error('Error parsing metaobject references:', parseError);
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        title: product.title,
        images: product.images || [],
        variants: product.variants || [],
        metaobjects: metaobjects || [],
        technicalInfo: technicalData
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

