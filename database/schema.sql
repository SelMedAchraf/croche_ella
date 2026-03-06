-- Croche Ella Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  colors TEXT[] DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_city VARCHAR(100) NOT NULL,
  delivery_notes TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  color VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Table
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Public Read Access
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Gallery is viewable by everyone"
  ON gallery FOR SELECT
  USING (true);

-- RLS Policies for Authenticated Admin
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
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

CREATE POLICY "Authenticated users can manage gallery"
  ON gallery FOR ALL
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

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

-- Storage policies
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');

-- ============================================
-- PRICE COMPONENTS TABLE
-- ============================================

CREATE TABLE price_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_price_components_category ON price_components(category);
CREATE INDEX idx_price_components_created ON price_components(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE price_components ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Public Read Access
CREATE POLICY "Price components are viewable by everyone"
  ON price_components FOR SELECT
  USING (true);

-- RLS Policies for Authenticated Admin
CREATE POLICY "Authenticated users can insert price components"
  ON price_components FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update price components"
  ON price_components FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete price components"
  ON price_components FOR DELETE
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
-- STORAGE BUCKET FOR PRICE COMPONENTS
-- ============================================

-- Insert storage bucket for price component images
INSERT INTO storage.buckets (id, name, public)
VALUES ('price-component-images', 'price-component-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view price component images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'price-component-images');

CREATE POLICY "Authenticated users can upload price component images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'price-component-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete price component images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'price-component-images' AND auth.role() = 'authenticated');
