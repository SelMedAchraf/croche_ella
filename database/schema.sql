-- Croche Ella Database Schema
-- Run this script in your Supabase SQL Editor

-- ============================================================================
-- REQUIRED STORAGE BUCKETS (Created automatically via schema)
-- ============================================================================
-- 1. product-images (Public) - For product photos
-- 2. item-images (Public) - For custom order item photos
-- 3. color-images (Public) - For color swatch images
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colors Table
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for color images
INSERT INTO storage.buckets (id, name, public)
VALUES ('color-images', 'color-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for color images
CREATE POLICY "Public can view color images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'color-images');

CREATE POLICY "Authenticated users can upload color images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'color-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete color images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'color-images' AND auth.role() = 'authenticated');

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_city VARCHAR(100) NOT NULL,
  full_address TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  delivery_type VARCHAR(50) DEFAULT 'home',
  delivery_price DECIMAL(10, 2) DEFAULT 0,
  deposit_value DECIMAL(10, 2) DEFAULT 0,
  deposit_proof_url TEXT,
  second_payment_completed BOOLEAN DEFAULT FALSE,
  second_payment_proof_url TEXT,
  admin_note TEXT,
  cancel_requested BOOLEAN DEFAULT FALSE,
  cancel_requested_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_delivery_type_valid CHECK (delivery_type IN ('home', 'stopdesk'))
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  custom_order_type VARCHAR(100),
  custom_data JSONB,
  reference_images JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sequence and Trigger for order_id
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_id := 'OD' || to_char(CURRENT_TIMESTAMP, 'YYMMDD') || lpad(nextval('order_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_id
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_id IS NULL)
EXECUTE FUNCTION generate_order_id();

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Public Read Access
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Colors are viewable by everyone"
  ON colors FOR SELECT
  USING (true);

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

-- RLS Policies for Authenticated Admin
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage colors"
  ON colors FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage product images"
  ON product_images FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view order items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for Public Order Creation
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Insert default categories
INSERT INTO categories (name) VALUES
('Crochet Flowers'),
('Crochet Bags'),
('Keychains');

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ============================================
-- ITEMS TABLE
-- ============================================

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created ON items(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Public Read Access
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  USING (true);

-- RLS Policies for Authenticated Admin
CREATE POLICY "Authenticated users can insert items"
  ON items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update items"
  ON items FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete items"
  ON items FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- DELIVERY PRICES TABLE
-- ============================================

CREATE TABLE delivery_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wilaya_code INTEGER NOT NULL UNIQUE,
  wilaya_name VARCHAR(255) NOT NULL,
  home_delivery_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stopdesk_delivery_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_delivery_wilaya_code ON delivery_prices(wilaya_code);

-- Enable Row Level Security (RLS)
ALTER TABLE delivery_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Public Read Access
CREATE POLICY "Delivery prices are viewable by everyone"
  ON delivery_prices FOR SELECT
  USING (true);

-- RLS Policies for Authenticated Admin
CREATE POLICY "Authenticated users can manage delivery prices"
  ON delivery_prices FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- INSERT DEFAULT ALGERIAN WILAYAS
-- ============================================

INSERT INTO delivery_prices (wilaya_code, wilaya_name, home_delivery_price, stopdesk_delivery_price) VALUES
(1, 'Adrar', 1200, 1000),
(2, 'Chlef', 800, 600),
(3, 'Laghouat', 1000, 800),
(4, 'Oum El Bouaghi', 800, 600),
(5, 'Batna', 800, 600),
(6, 'Béjaïa', 800, 600),
(7, 'Biskra', 900, 700),
(8, 'Béchar', 1200, 1000),
(9, 'Blida', 600, 400),
(10, 'Bouira', 700, 500),
(11, 'Tamanrasset', 1500, 1300),
(12, 'Tébessa', 900, 700),
(13, 'Tlemcen', 900, 700),
(14, 'Tiaret', 900, 700),
(15, 'Tizi Ouzou', 700, 500),
(16, 'Alger', 500, 300),
(17, 'Djelfa', 900, 700),
(18, 'Jijel', 800, 600),
(19, 'Sétif', 800, 600),
(20, 'Saïda', 900, 700),
(21, 'Skikda', 800, 600),
(22, 'Sidi Bel Abbès', 900, 700),
(23, 'Annaba', 800, 600),
(24, 'Guelma', 800, 600),
(25, 'Constantine', 800, 600),
(26, 'Médéa', 700, 500),
(27, 'Mostaganem', 800, 600),
(28, 'M''Sila', 900, 700),
(29, 'Mascara', 900, 700),
(30, 'Ouargla', 1100, 900),
(31, 'Oran', 800, 600),
(32, 'El Bayadh', 1000, 800),
(33, 'Illizi', 1500, 1300),
(34, 'Bordj Bou Arréridj', 800, 600),
(35, 'Boumerdès', 600, 400),
(36, 'El Tarf', 900, 700),
(37, 'Tindouf', 1500, 1300),
(38, 'Tissemsilt', 900, 700),
(39, 'El Oued', 1000, 800),
(40, 'Khenchela', 900, 700),
(41, 'Souk Ahras', 900, 700),
(42, 'Tipaza', 600, 400),
(43, 'Mila', 800, 600),
(44, 'Aïn Defla', 700, 500),
(45, 'Naâma', 1100, 900),
(46, 'Aïn Témouchent', 900, 700),
(47, 'Ghardaïa', 1100, 900),
(48, 'Relizane', 800, 600),
(49, 'Timimoun', 1300, 1100),
(50, 'Bordj Badji Mokhtar', 1600, 1400),
(51, 'Ouled Djellal', 1000, 800),
(52, 'Béni Abbès', 1300, 1100),
(53, 'In Salah', 1400, 1200),
(54, 'In Guezzam', 1600, 1400),
(55, 'Touggourt', 1100, 900),
(56, 'Djanet', 1600, 1400),
(57, 'El M''Ghair', 1100, 900),
(58, 'El Meniaa', 1200, 1000);

-- ============================================
-- STORAGE BUCKET FOR ITEMS
-- ============================================

-- Insert storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete item images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'item-images' AND auth.role() = 'authenticated');
-- ============================================
-- STORAGE BUCKET FOR CUSTOM ORDER REFERENCE IMAGES
-- ============================================

-- Insert storage bucket for custom order reference images
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-order-images', 'custom-order-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view custom order images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'custom-order-images');

CREATE POLICY "Anyone can upload custom order reference images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'custom-order-images');

CREATE POLICY "Authenticated users can delete custom order images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'custom-order-images' AND auth.role() = 'authenticated');
