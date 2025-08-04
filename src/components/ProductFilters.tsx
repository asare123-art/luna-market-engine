
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export const ProductFilters = ({ filters, onFiltersChange, onClearFilters }: ProductFiltersProps) => {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: true,
    availability: true
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      // Get available categories
      const { data: categoryData } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      // Get available brands
      const { data: brandData } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null);

      // Get price range
      const { data: priceData } = await supabase
        .from('products')
        .select('price')
        .order('price');

      if (categoryData) {
        const uniqueCategories = [...new Set(categoryData.map(item => item.category))];
        setAvailableCategories(uniqueCategories);
      }

      if (brandData) {
        const uniqueBrands = [...new Set(brandData.map(item => item.brand).filter(Boolean))];
        setAvailableBrands(uniqueBrands);
      }

      if (priceData && priceData.length > 0) {
        const minPrice = Math.floor(priceData[0].price);
        const maxPrice = Math.ceil(priceData[priceData.length - 1].price);
        setPriceRange([minPrice, maxPrice]);
        
        // Update filters if this is the initial load
        if (filters.priceRange[0] === 0 && filters.priceRange[1] === 1000) {
          onFiltersChange({
            ...filters,
            priceRange: [minPrice, maxPrice]
          });
        }
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked 
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    
    onFiltersChange({
      ...filters,
      brands: newBrands
    });
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categories */}
        <Collapsible open={openSections.categories}>
          <CollapsibleTrigger 
            className="flex items-center justify-between w-full p-0 hover:no-underline"
            onClick={() => toggleSection('categories')}
          >
            <h3 className="font-medium">Categories</h3>
            {openSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {availableCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <label 
                  htmlFor={`category-${category}`} 
                  className="text-sm cursor-pointer hover:text-primary"
                >
                  {category}
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Brands */}
        <Collapsible open={openSections.brands}>
          <CollapsibleTrigger 
            className="flex items-center justify-between w-full p-0 hover:no-underline"
            onClick={() => toggleSection('brands')}
          >
            <h3 className="font-medium">Brands</h3>
            {openSections.brands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {availableBrands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                />
                <label 
                  htmlFor={`brand-${brand}`} 
                  className="text-sm cursor-pointer hover:text-primary"
                >
                  {brand}
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible open={openSections.price}>
          <CollapsibleTrigger 
            className="flex items-center justify-between w-full p-0 hover:no-underline"
            onClick={() => toggleSection('price')}
          >
            <h3 className="font-medium">Price Range</h3>
            {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
              max={priceRange[1]}
              min={priceRange[0]}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Rating */}
        <Collapsible open={openSections.rating}>
          <CollapsibleTrigger 
            className="flex items-center justify-between w-full p-0 hover:no-underline"
            onClick={() => toggleSection('rating')}
          >
            <h3 className="font-medium">Minimum Rating</h3>
            {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {[4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.rating === rating}
                  onCheckedChange={(checked) => {
                    onFiltersChange({
                      ...filters,
                      rating: checked ? rating : 0
                    });
                  }}
                />
                <label 
                  htmlFor={`rating-${rating}`} 
                  className="text-sm cursor-pointer hover:text-primary flex items-center"
                >
                  {rating}+ ⭐
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Availability */}
        <Collapsible open={openSections.availability}>
          <CollapsibleTrigger 
            className="flex items-center justify-between w-full p-0 hover:no-underline"
            onClick={() => toggleSection('availability')}
          >
            <h3 className="font-medium">Availability</h3>
            {openSections.availability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, inStock: checked as boolean })}
              />
              <label 
                htmlFor="in-stock" 
                className="text-sm cursor-pointer hover:text-primary"
              >
                In Stock Only
              </label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
