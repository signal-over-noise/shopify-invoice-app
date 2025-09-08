import { NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

export async function GET() {
  try {
    console.log('Testing Shopify connection...');
    
    const result = await shopifyClient.testConnection();
    
    if (result.success) {
      // console.log('Shopify connection successful:', result.store);
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        store: result.store
      });
    } else {
      console.error('Shopify connection failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Test connection error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      },
      { status: 500 }
    );
  }
}