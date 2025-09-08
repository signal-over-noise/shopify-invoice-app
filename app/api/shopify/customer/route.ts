// app/api/shopify/customer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const customer = await shopifyClient.getCustomer(parseInt(customerId));
    
    // Debug: log the full customer object
    console.log('Full customer object from Shopify:', customer);

    if (customer) {
      return NextResponse.json({
        success: true,
        customer: customer, // Return the full customer object to see what fields we get
        debug: {
          has_first_name: !!customer.first_name,
          has_last_name: !!customer.last_name,
          available_fields: Object.keys(customer)
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Customer API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}