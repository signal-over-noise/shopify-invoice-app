import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const draftOrderId = searchParams.get('id');

    if (!draftOrderId) {
      return NextResponse.json(
        { success: false, error: 'Draft Order ID is required' },
        { status: 400 }
      );
    }

    const order = await shopifyClient.getDraftOrder(parseInt(draftOrderId));

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Draft Order API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch draft order' },
      { status: 500 }
    );
  }
}