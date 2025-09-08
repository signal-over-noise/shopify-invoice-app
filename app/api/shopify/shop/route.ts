import { NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

export async function GET() {
  try {
    const shopData = await shopifyClient.getShopDetails();
    
    if (shopData.success) {
      return NextResponse.json({
        success: true,
        shop: {
          name: shopData.shop.name,
          email: shopData.shop.email,
          phone: shopData.shop.phone,
          address: {
            line1: shopData.shop.address1 || '',
            line2: shopData.shop.address2 || '',
            city: shopData.shop.city || '',
            state: shopData.shop.province || '',
            country: shopData.shop.country_name || shopData.shop.country || '',
            zip: shopData.shop.zip || ''
          },
          domain: shopData.shop.domain,
          currency: shopData.shop.currency
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: shopData.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Shop API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop details' },
      { status: 500 }
    );
  }
}