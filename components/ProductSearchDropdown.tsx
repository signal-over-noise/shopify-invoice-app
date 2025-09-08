'use client';

import { useState, useEffect, useRef } from 'react';

interface ProductVariant {
  id: number;
  title: string;
  price: string;
  sku: string;
}

interface Product {
  id: number;
  title: string;
  variants: ProductVariant[];
}

interface ProductSearchDropdownProps {
  onSelectProduct: (product: Product, variant: ProductVariant) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ProductSearchDropdown({ 
  onSelectProduct, 
  value, 
  onChange, 
  placeholder = "Search products..." 
}: ProductSearchDropdownProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchProducts = async (query: string) => {
    if (query.length < 2) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/shopify/products/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchProducts(value);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleProductSelect = (product: Product, variant: ProductVariant) => {
    onSelectProduct(product, variant);
    onChange(`${product.title} - ${variant.title}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const flattenedOptions = products.flatMap(product => 
    product.variants.map(variant => ({ product, variant }))
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 text-gray-500 w-full"
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            style={{
              maxHeight: '240px',
              top: '100%',
              left: 0,
              right: 0,
              transform: (() => {
                if (!dropdownRef.current) return 'none';
                const rect = dropdownRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                
                // If not enough space below but more space above, show above
                if (spaceBelow < 240 && spaceAbove > spaceBelow) {
                  return 'translateY(-100%) translateY(-8px)';
                }
                return 'none';
              })()
            }}>
          {loading && (
            <div className="px-3 py-2 text-sm text-slate-500">
              Searching...
            </div>
          )}
          
          {!loading && flattenedOptions.length === 0 && value.length >= 2 && (
            <div className="px-3 py-2 text-sm text-slate-500">
              No products found
            </div>
          )}
          
          {!loading && flattenedOptions.map((option, index) => (
            <div
              key={`${option.product.id}-${option.variant.id}`}
              onClick={() => handleProductSelect(option.product, option.variant)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-slate-100 ${
                index === highlightedIndex ? 'bg-slate-100' : ''
              }`}
            >
              <div className="font-medium text-slate-900">
                {option.product.title}
              </div>
              <div className="text-slate-600">
                {option.variant.title} - £{option.variant.price}
                {option.variant.sku && (
                  <span className="ml-2 text-slate-500">({option.variant.sku})</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}