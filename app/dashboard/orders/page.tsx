// app/dashboard/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopifyOrder, PaginationInfo } from '@/types/shopify';

export default function OrdersPage() {
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    hasNext: false,
    hasPrevious: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [orderType, setOrderType] = useState<'all' | 'regular' | 'draft'>('all');
  const router = useRouter();
  const [customerNames, setCustomerNames] = useState<Record<number, string>>({});

  const fetchCustomerNames = async (orders: ShopifyOrder[]) => {
  
  const customerPromises = orders
    .filter(order => order.customer?.id && !customerNames[order.customer.id])
    .map(async (order) => {
      
      try {
        const response = await fetch(`/api/shopify/customer?id=${order.customer!.id}`);
        const data = await response.json();
        
        if (data.success && data.customer) {
          const fullName = `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim();
          
          return {
            id: order.customer!.id,
            name: fullName || 'No Name Available'
          };
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
      }
      return null;
    });

  const customerResults = await Promise.all(customerPromises);
  
  const newCustomerNames = { ...customerNames };
  
  customerResults.forEach(result => {
    if (result) {
      newCustomerNames[result.id] = result.name;
    }
  });
  
  setCustomerNames(newCustomerNames);
};

  // Test Shopify connection first
  const testConnection = async () => {
    try {
      const response = await fetch('/api/shopify/test');
      const data = await response.json();
      setConnectionTest(data);
      
      if (!data.success) {
        setError('Shopify connection failed: ' + data.error);
        setLoading(false);
        return false;
      }
      
      return true;
    } catch (err) {
      setError('Failed to connect to Shopify API');
      setLoading(false);
      return false;
    }
  };

  // Fetch orders from Shopify
  const fetchOrders = async (pageInfo?: string, type: 'all' | 'regular' | 'draft' = 'all') => {
    try {
      setLoading(true);
      let url = `/api/shopify/orders?limit=20&type=${type}`;
      
      if (pageInfo) {
        url += `&page_info=${pageInfo}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
        setError('');

        await fetchCustomerNames(data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders from Shopify');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const connectionOk = await testConnection();
      if (connectionOk) {
        await fetchOrders(undefined, orderType);
      }
    };
    
    initializeData();
  }, [orderType]);

  const handleNextPage = () => {
    if (pagination.hasNext && pagination.nextPageInfo) {
      fetchOrders(pagination.nextPageInfo, orderType);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrevious && pagination.previousPageInfo) {
      fetchOrders(pagination.previousPageInfo, orderType);
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleOrderTypeChange = (type: 'all' | 'regular' | 'draft') => {
    setOrderType(type);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: string, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(price));
  };

  const getStatusBadge = (order: ShopifyOrder) => {
    const isDraft = order.order_type === 'draft';
    const status = isDraft ? order.status : order.financial_status;
    
    const statusColors = {
      // Regular order statuses
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      authorized: 'bg-blue-100 text-blue-800',
      partially_paid: 'bg-orange-100 text-orange-800',
      refunded: 'bg-red-100 text-red-800',
      voided: 'bg-gray-100 text-gray-800',
      // Draft order statuses
      open: 'bg-blue-100 text-blue-800',
      invoice_sent: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    };
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
        }`}>
          {status?.replace('_', ' ')}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          isDraft ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {isDraft ? 'Draft' : 'Order'}
        </span>
      </div>
    );
  };

  const getOrderIdentifier = (order: ShopifyOrder) => {
    if (order.order_type === 'draft') {
      return `Draft #${order.id}`;
    }
    return order.order_number ? `#${order.order_number}` : `#${order.id}`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-slate-900">Shopify Orders</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900 mx-auto"></div>
              <p className="mt-2 text-slate-600 text-sm">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-slate-900">Shopify Orders</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                {connectionTest && !connectionTest.success && (
                  <div className="mt-3 text-xs text-red-600">
                    <p>Please check your Shopify API credentials in your .env.local file:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>SHOPIFY_STORE_URL</li>
                      <li>SHOPIFY_ADMIN_API_TOKEN</li>
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Shopify Orders</h1>
                <p className="text-sm text-slate-600">{orders.length} orders found</p>
              </div>
            </div>
            {connectionTest?.success && (
              <div className="text-sm text-slate-600">
                Connected to: <span className="font-medium">{connectionTest.store.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'regular', label: 'Regular Orders' },
              { key: 'draft', label: 'Draft Orders' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleOrderTypeChange(tab.key as 'all' | 'regular' | 'draft')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  orderType === tab.key
                    ? 'border-slate-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders List */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No orders found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {orderType === 'all' ? 'Your Shopify store doesn\'t have any orders yet.' : 
               orderType === 'draft' ? 'No draft orders found.' : 'No regular orders found.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr key={`${order.order_type}-${order.id}`} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{getOrderIdentifier(order)}</div>
                        <div className="text-sm text-slate-500">{order.line_items.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                            {(() => {
                                // Try to get name from customer object (works on higher plans)
                                if (order.customer?.first_name || order.customer?.last_name) {
                                return `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
                                }
                                
                                // Try to get name from customer addresses (backup for higher plans)
                                if (order.customer?.default_address?.first_name) {
                                return `${order.customer.default_address.first_name} ${order.customer.default_address.last_name || ''}`.trim();
                                }
                                
                                // For Basic plan: show customer ID if customer exists
                                if (order.customer?.id) {
                                return `Customer #${order.customer.id.toString().slice(-4)}`;
                                }
                                
                                // No customer (guest checkout)
                                return 'Guest Customer';
                            })()}
                        </div>
                        <div className="text-sm text-slate-500">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {formatPrice(order.total_price, order.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/dashboard/invoice?orderId=${order.id}&orderType=${order.order_type}`)}
                          className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md text-sm transition-colors"
                        >
                          Create Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(pagination.hasNext || pagination.hasPrevious) && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!pagination.hasPrevious || loading}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.hasNext || loading}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing page <span className="font-medium">{currentPage}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!pagination.hasPrevious || loading}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={!pagination.hasNext || loading}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}