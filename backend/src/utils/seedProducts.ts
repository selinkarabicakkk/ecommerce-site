import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Category, Product } from '../models';

dotenv.config();

type ProductSeed = {
  name: string;
  description: string;
  price: number;
  imagePaths: string[];
  stock: number;
  sku: string;
  tags?: string[];
};

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const categoryToFolder: Record<string, string> = {
  'Electronics': 'electronics',
  'Clothing': 'clothing',
  'Home and Garden': 'home-garden',
  'Sports': 'sports',
  'Books': 'books',
  'Health and Beauty': 'health-beauty',
  'Toys': 'toys',
  'Food': 'food',
};

const seedsByCategory: Record<string, ProductSeed[]> = {
  'Electronics': [
    {
      name: 'Laptop 14" Pro',
      description: 'Günlük kullanım ve iş için hafif, güçlü 14 inç laptop.',
      price: 29999,
      imagePaths: ['/images/products/electronics/laptop-01.jpg'],
      stock: 25,
      sku: 'ELEC-101',
      tags: ['laptop', 'computer'],
    },
    {
      name: 'Smartphone X1',
      description: 'Yüksek performanslı kamera ve uzun pil ömrü.',
      price: 19999,
      imagePaths: ['/images/products/electronics/smartphone-01.jpg'],
      stock: 40,
      sku: 'ELEC-102',
      tags: ['smartphone', 'mobile'],
    },
    {
      name: 'Wireless Headphones',
      description: 'Aktif gürültü engelleme özellikli kablosuz kulaklık.',
      price: 4999,
      imagePaths: ['/images/products/electronics/headphones-01.jpg'],
      stock: 60,
      sku: 'ELEC-103',
      tags: ['audio', 'headphones'],
    },
    {
      name: 'Mirrorless Camera',
      description: '4K video destekli, kompakt aynasız fotoğraf makinesi.',
      price: 25999,
      imagePaths: ['/images/products/electronics/camera-01.jpg'],
      stock: 15,
      sku: 'ELEC-104',
      tags: ['camera', 'photo'],
    },
  ],
  'Clothing': [
    {
      name: 'Basic T-Shirt',
      description: '%100 pamuk, günlük kullanım için rahat tişört.',
      price: 249,
      imagePaths: ['/images/products/clothing/tshirt-01.jpg'],
      stock: 150,
      sku: 'CLOTH-101',
      tags: ['tshirt', 'casual'],
    },
    {
      name: 'Denim Jeans',
      description: 'Düz kesim, dayanıklı denim kot pantolon.',
      price: 799,
      imagePaths: ['/images/products/clothing/jeans-01.jpg'],
      stock: 120,
      sku: 'CLOTH-102',
      tags: ['jeans', 'denim'],
    },
    {
      name: 'Lightweight Jacket',
      description: 'Mevsimlik, suya dayanıklı hafif ceket.',
      price: 1299,
      imagePaths: ['/images/products/clothing/jacket-01.jpg'],
      stock: 60,
      sku: 'CLOTH-103',
      tags: ['jacket', 'outerwear'],
    },
    {
      name: 'Running Sneakers',
      description: 'Nefes alabilen kumaşlı, hafif koşu ayakkabısı.',
      price: 1599,
      imagePaths: ['/images/products/clothing/sneakers-01.jpg'],
      stock: 90,
      sku: 'CLOTH-104',
      tags: ['sneakers', 'running'],
    },
  ],
  'Home and Garden': [
    {
      name: 'Modern Sofa',
      description: 'Geniş oturum alanına sahip modern kanepe.',
      price: 14999,
      imagePaths: ['/images/products/home-garden/sofa-01.jpg'],
      stock: 10,
      sku: 'HOME-101',
      tags: ['sofa', 'furniture'],
    },
    {
      name: 'Table Lamp',
      description: 'Sıcak ışık yayan masa lambası.',
      price: 499,
      imagePaths: ['/images/products/home-garden/lamp-01.jpg'],
      stock: 70,
      sku: 'HOME-102',
      tags: ['lamp', 'lighting'],
    },
    {
      name: 'Cookware Set',
      description: 'Yapışmaz yüzeyli 7 parça tencere seti.',
      price: 2199,
      imagePaths: ['/images/products/home-garden/cookware-01.jpg'],
      stock: 35,
      sku: 'HOME-103',
      tags: ['cookware', 'kitchen'],
    },
    {
      name: 'Indoor Plant',
      description: 'Düşük bakım gerektiren, iç mekân bitkisi.',
      price: 299,
      imagePaths: ['/images/products/home-garden/plant-01.jpg'],
      stock: 80,
      sku: 'HOME-104',
      tags: ['plant', 'decor'],
    },
  ],
  'Sports': [
    {
      name: 'Football',
      description: 'Dayanıklı dış yüzeye sahip futbol topu.',
      price: 399,
      imagePaths: ['/images/products/sports/football-01.jpg'],
      stock: 100,
      sku: 'SPORT-101',
      tags: ['football', 'ball'],
    },
    {
      name: 'Yoga Mat',
      description: 'Kaymaz yüzeyli, orta kalınlıkta yoga matı.',
      price: 299,
      imagePaths: ['/images/products/sports/yoga-mat-01.jpg'],
      stock: 120,
      sku: 'SPORT-102',
      tags: ['yoga', 'fitness'],
    },
    {
      name: 'Dumbbell 5kg',
      description: 'Evcimen antrenmanlar için 5 kg dambıl.',
      price: 249,
      imagePaths: ['/images/products/sports/dumbbell-01.jpg'],
      stock: 80,
      sku: 'SPORT-103',
      tags: ['dumbbell', 'strength'],
    },
    {
      name: 'City Bicycle',
      description: 'Günlük şehir içi kullanım için konforlu bisiklet.',
      price: 5999,
      imagePaths: ['/images/products/sports/bicycle-01.jpg'],
      stock: 12,
      sku: 'SPORT-104',
      tags: ['bicycle', 'outdoor'],
    },
  ],
  'Books': [
    {
      name: 'Contemporary Novel',
      description: 'Modern kurgu türünde sürükleyici bir roman.',
      price: 199,
      imagePaths: ['/images/products/books/novel-01.jpg'],
      stock: 200,
      sku: 'BOOK-101',
      tags: ['novel', 'literature'],
    },
    {
      name: 'Science Fiction',
      description: 'Geleceğin teknolojilerini konu alan bilim kurgu.',
      price: 179,
      imagePaths: ['/images/products/books/sci-fi-01.jpg'],
      stock: 160,
      sku: 'BOOK-102',
      tags: ['sci-fi', 'fiction'],
    },
    {
      name: 'Non-Fiction Bestseller',
      description: 'Gerçek hayattan ilham veren başarı hikâyeleri.',
      price: 219,
      imagePaths: ['/images/products/books/non-fiction-01.jpg'],
      stock: 140,
      sku: 'BOOK-103',
      tags: ['non-fiction', 'bestseller'],
    },
    {
      name: 'Children Story Book',
      description: 'Renkli çizimlerle dolu, çocuklar için hikâye kitabı.',
      price: 129,
      imagePaths: ['/images/products/books/children-book-01.jpg'],
      stock: 180,
      sku: 'BOOK-104',
      tags: ['children', 'story'],
    },
  ],
  'Health and Beauty': [
    {
      name: 'Skincare Serum',
      description: 'Nemlendirici ve aydınlatıcı etkili yüz serumu.',
      price: 499,
      imagePaths: ['/images/products/health-beauty/skincare-01.jpg'],
      stock: 90,
      sku: 'HLTH-101',
      tags: ['skincare', 'serum'],
    },
    {
      name: 'Daily Shampoo',
      description: 'Tüm saç tiplerine uygun günlük şampuan.',
      price: 159,
      imagePaths: ['/images/products/health-beauty/shampoo-01.jpg'],
      stock: 130,
      sku: 'HLTH-102',
      tags: ['shampoo', 'hair'],
    },
    {
      name: 'Eau de Parfum',
      description: 'Kalıcı, çiçeksi notalara sahip parfüm.',
      price: 1099,
      imagePaths: ['/images/products/health-beauty/perfume-01.jpg'],
      stock: 50,
      sku: 'HLTH-103',
      tags: ['perfume', 'beauty'],
    },
    {
      name: 'Hair Dryer',
      description: 'Seramik ısıtıcı, iyon teknolojili saç kurutma makinesi.',
      price: 699,
      imagePaths: ['/images/products/health-beauty/hairdryer-01.jpg'],
      stock: 35,
      sku: 'HLTH-104',
      tags: ['hairdryer', 'styling'],
    },
  ],
  'Toys': [
    {
      name: 'Building Blocks Set',
      description: 'Yaratıcılığı teşvik eden büyük parça blok seti.',
      price: 349,
      imagePaths: ['/images/products/toys/lego-01.jpg'],
      stock: 110,
      sku: 'TOY-101',
      tags: ['blocks', 'lego'],
    },
    {
      name: 'Classic Doll',
      description: 'Yumuşak gövdeli, aksesuar setli oyuncak bebek.',
      price: 279,
      imagePaths: ['/images/products/toys/doll-01.jpg'],
      stock: 90,
      sku: 'TOY-102',
      tags: ['doll', 'kids'],
    },
    {
      name: 'RC Car',
      description: '2.4GHz uzaktan kumandalı hızlı yarış arabası.',
      price: 599,
      imagePaths: ['/images/products/toys/rc-car-01.jpg'],
      stock: 55,
      sku: 'TOY-103',
      tags: ['rc', 'car'],
    },
    {
      name: 'Puzzle 1000',
      description: '1000 parçalık manzara temalı puzzle.',
      price: 199,
      imagePaths: ['/images/products/toys/puzzle-01.jpg'],
      stock: 140,
      sku: 'TOY-104',
      tags: ['puzzle', 'game'],
    },
  ],
  'Food': [
    {
      name: 'Premium Coffee Beans',
      description: 'Orta kavrulmuş, tam çekirdek kahve.',
      price: 249,
      imagePaths: ['/images/products/food/coffee-01.jpg'],
      stock: 120,
      sku: 'FOOD-101',
      tags: ['coffee', 'beans'],
    },
    {
      name: 'Dark Chocolate',
      description: 'En az %70 kakao içeren bitter çikolata.',
      price: 79,
      imagePaths: ['/images/products/food/chocolate-01.jpg'],
      stock: 200,
      sku: 'FOOD-102',
      tags: ['chocolate', 'snack'],
    },
    {
      name: 'Italian Pasta',
      description: 'Bronz kalıptan geçirilmiş makarna.',
      price: 49,
      imagePaths: ['/images/products/food/pasta-01.jpg'],
      stock: 220,
      sku: 'FOOD-103',
      tags: ['pasta', 'italian'],
    },
    {
      name: 'Extra Virgin Olive Oil',
      description: 'Soğuk sıkım, sızma zeytinyağı.',
      price: 179,
      imagePaths: ['/images/products/food/olive-oil-01.jpg'],
      stock: 140,
      sku: 'FOOD-104',
      tags: ['olive-oil', 'gourmet'],
    },
  ],
};

async function seedProducts() {
  await connectDB();

  const categoryNames = Object.keys(seedsByCategory);

  for (const categoryName of categoryNames) {
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      console.warn(`Category not found, skipping: ${categoryName}`);
      continue;
    }

    const seeds = seedsByCategory[categoryName];

    for (const seed of seeds) {
      const slug = slugify(seed.name);

      // Skip if SKU or slug already exists
      const existing = await Product.findOne({ $or: [{ sku: seed.sku }, { slug }] });
      if (existing) {
        console.log(`Exists, skip: ${seed.sku} (${seed.name})`);
        continue;
      }

      await Product.create({
        name: seed.name,
        description: seed.description,
        price: seed.price,
        category: category._id,
        images: seed.imagePaths,
        specifications: {},
        tags: seed.tags || [],
        isFeatured: false,
        isActive: true,
        slug,
        variants: [],
        averageRating: 0,
        numReviews: 0,
        stock: seed.stock,
        sku: seed.sku,
      });
      console.log(`Inserted: ${seed.sku} (${seed.name})`);
    }
  }

  console.log('Product seeding completed.');
  process.exit(0);
}

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});


