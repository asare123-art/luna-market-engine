
-- Add missing columns to products table for better search and filtering
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS popularity_score integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[];

-- Create an index for better search performance
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description || ' ' || coalesce(brand, '')));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);

-- Update existing products with sample data for demonstration
UPDATE products SET 
  brand = CASE 
    WHEN category = 'Electronics' THEN (ARRAY['Apple', 'Samsung', 'Sony', 'LG'])[floor(random() * 4 + 1)]
    WHEN category = 'Fashion' THEN (ARRAY['Nike', 'Adidas', 'H&M', 'Zara'])[floor(random() * 4 + 1)]
    WHEN category = 'Home' THEN (ARRAY['IKEA', 'Target', 'HomeDepot', 'Wayfair'])[floor(random() * 4 + 1)]
    ELSE 'Generic'
  END,
  rating = round((random() * 4 + 1)::numeric, 1),
  review_count = floor(random() * 500 + 10),
  popularity_score = floor(random() * 1000 + 50)
WHERE brand IS NULL;
