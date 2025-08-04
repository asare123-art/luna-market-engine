
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand';
  value: string;
  id?: string;
  count?: number;
}

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchAutocomplete = ({ onSearch, placeholder = "Search products...", className }: SearchAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        // Search products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .ilike('name', `%${query}%`)
          .limit(5);

        if (productsError) throw productsError;

        // Search categories
        const { data: categories, error: categoriesError } = await supabase
          .from('products')
          .select('category')
          .ilike('category', `%${query}%`)
          .limit(3);

        if (categoriesError) throw categoriesError;

        // Search brands
        const { data: brands, error: brandsError } = await supabase
          .from('products')
          .select('brand')
          .not('brand', 'is', null)
          .ilike('brand', `%${query}%`)
          .limit(3);

        if (brandsError) throw brandsError;

        const productSuggestions: SearchSuggestion[] = products?.map(p => ({
          type: 'product' as const,
          value: p.name,
          id: p.id
        })) || [];

        const uniqueCategories = [...new Set(categories?.map(c => c.category))];
        const categorySuggestions: SearchSuggestion[] = uniqueCategories.map(category => ({
          type: 'category' as const,
          value: category
        }));

        const uniqueBrands = [...new Set(brands?.map(b => b.brand).filter(Boolean))];
        const brandSuggestions: SearchSuggestion[] = uniqueBrands.map(brand => ({
          type: 'brand' as const,
          value: brand!
        }));

        setSuggestions([...productSuggestions, ...categorySuggestions, ...brandSuggestions]);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery: string = query) => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
    setIsOpen(false);
    setQuery("");
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product' && suggestion.id) {
      navigate(`/products/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      navigate(`/products?category=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === 'brand') {
      navigate(`/products?brand=${encodeURIComponent(suggestion.value)}`);
    } else {
      handleSearch(suggestion.value);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return '📦';
      case 'category':
        return '📂';
      case 'brand':
        return '🏷️';
      default:
        return '🔍';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
            if (e.key === 'Escape') {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (query.length >= 2 || suggestions.length > 0) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.value}</div>
                    <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No suggestions found
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};
