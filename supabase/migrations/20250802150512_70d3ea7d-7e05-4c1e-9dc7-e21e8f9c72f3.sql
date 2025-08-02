
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only admins can insert products" ON public.products FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'admin@lunamarket.com');
CREATE POLICY "Only admins can update products" ON public.products FOR UPDATE USING (auth.jwt() ->> 'email' = 'admin@lunamarket.com');
CREATE POLICY "Only admins can delete products" ON public.products FOR DELETE USING (auth.jwt() ->> 'email' = 'admin@lunamarket.com');

-- Cart items policies (users can manage their own cart)
CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Orders policies (users can manage their own orders)
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@lunamarket.com');

-- Order items policies (users can view their own order items, admins can view all)
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@lunamarket.com');

-- Insert some sample products for testing
INSERT INTO public.products (name, description, price, category, stock, image_url) VALUES 
('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 'Electronics', 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'),
('Organic Cotton T-Shirt', 'Soft and comfortable organic cotton t-shirt', 29.99, 'Clothing', 100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop'),
('Coffee Maker Deluxe', 'Professional grade coffee maker for home use', 149.99, 'Home & Kitchen', 25, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop'),
('Yoga Mat Pro', 'Non-slip yoga mat for all types of practice', 39.99, 'Sports', 75, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Smartphone Case', 'Protective case for smartphones with stylish design', 24.99, 'Electronics', 200, 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop'),
('Running Shoes', 'Comfortable running shoes for daily training', 89.99, 'Sports', 60, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'),
('Desk Lamp LED', 'Modern LED desk lamp with adjustable brightness', 59.99, 'Home & Kitchen', 40, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'),
('Winter Jacket', 'Warm and stylish winter jacket for cold weather', 129.99, 'Clothing', 35, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop');
