
import { useState, useEffect, useRef } from "react";
import { Search, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchAutocompleteProps {
  onSearch?: (term: string) => void;
  placeholder?: string;
}

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'recent';
  text: string;
  id?: string;
  category?: string;
}

export const SearchAutocomplete = ({ onSearch, placeholder = "Search products..." }: SearchAutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const timer = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const fetchSuggestions = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      // Fetch product suggestions
      const { data: products } = await supabase
        .from('products')
        .select('id, name, category, brand')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
        .limit(5);

      const suggestions: SearchSuggestion[] = [];

      // Add product suggestions
      products?.forEach(product => {
        suggestions.push({
          type: 'product',
          text: product.name,
          id: product.id,
          category: product.category
        });
      });

      // Add unique categories and brands
      const categories = [...new Set(products?.map(p => p.category) || [])];
      const brands = [...new Set(products?.map(p => p.brand).filter(Boolean) || [])];

      categories.slice(0, 2).forEach(category => {
        suggestions.push({
          type: 'category',
          text: `in ${category}`,
        });
      });

      brands.slice(0, 2).forEach(brand => {
        if (brand && brand.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.push({
            type: 'brand',
            text: `${brand} products`,
          });
        }
      });

      // Add recent searches if no other suggestions
      if (suggestions.length === 0 && recentSearches.length > 0) {
        recentSearches
          .filter(recent => recent.toLowerCase().includes(searchTerm.toLowerCase()))
          .slice(0, 3)
          .forEach(recent => {
            suggestions.push({
              type: 'recent',
              text: recent,
            });
          });
      }

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) return;

    // Save to recent searches
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    if (onSearch) {
      onSearch(term);
    } else {
      navigate(`/products?search=${encodeURIComponent(term)}`);
    }
    
    setShowSuggestions(false);
    setSearchTerm("");
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product' && suggestion.id) {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      const category = suggestion.text.replace('in ', '');
      navigate(`/products?category=${encodeURIComponent(category)}`);
    } else if (suggestion.type === 'brand') {
      const brand = suggestion.text.replace(' products', '');
      navigate(`/products?brand=${encodeURIComponent(brand)}`);
    } else {
      handleSearch(suggestion.text);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchTerm);
            } else if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
      </div>

      {showSuggestions && (searchTerm.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  {suggestion.type === 'product' && <Search className="h-4 w-4 text-gray-400" />}
                  {suggestion.type === 'category' && <span className="text-blue-600 font-medium">Category:</span>}
                  {suggestion.type === 'brand' && <span className="text-green-600 font-medium">Brand:</span>}
                  {suggestion.type === 'recent' && <Clock className="h-4 w-4 text-gray-400" />}
                  <span className="flex-1">{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && searchTerm.length === 0 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-gray-600 flex items-center justify-between">
                Recent Searches
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="p-1 h-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {recentSearches.slice(0, 5).map((recent, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(recent)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{recent}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && suggestions.length === 0 && searchTerm.length > 0 && (
            <div className="p-4 text-center text-gray-500">
              No suggestions found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
