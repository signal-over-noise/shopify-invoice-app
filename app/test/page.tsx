// app/test/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token));
        setTokenInfo({
          token: token,
          payload: payload,
          isValid: payload.exp > Date.now(),
          expires: new Date(payload.exp).toLocaleString()
        });
      } catch (e) {
        setTokenInfo({ error: 'Invalid token format' });
      }
    } else {
      setTokenInfo({ error: 'No token found' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Auth Test Page</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Token Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 space-x-4">
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </a>
          <a 
            href="/dashboard" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Dashboard
          </a>
          <button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.reload();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Token
          </button>
        </div>
      </div>
    </div>
  );
}