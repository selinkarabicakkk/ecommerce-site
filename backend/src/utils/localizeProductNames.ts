import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Product } from '../models';

dotenv.config();

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü\s-]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

// İngilizce -> Türkçe isim eşlemesi
const nameMap: Record<string, string> = {
  // Electronics
  "Laptop 14\" Pro": '14" Dizüstü Pro',
  'Smartphone X1': 'Akıllı Telefon X1',
  'Wireless Headphones': 'Kablosuz Kulaklık',
  'Mirrorless Camera': 'Aynasız Fotoğraf Makinesi',
  // Legacy seeder names
  'Smartphone X': 'Akıllı Telefon X',
  'Laptop Pro': 'Dizüstü Bilgisayar Pro',

  // Clothing
  'Basic T-Shirt': 'Basic Tişört',
  'Denim Jeans': 'Denim Kot Pantolon',
  'Lightweight Jacket': 'Hafif Ceket',
  'Running Sneakers': 'Koşu Ayakkabısı',
  'Classic T-Shirt': 'Klasik Tişört',

  // Home and Garden
  'Modern Sofa': 'Modern Kanepe',
  'Table Lamp': 'Masa Lambası',
  'Cookware Set': 'Tencere Seti',
  'Indoor Plant': 'İç Mekân Bitkisi',

  // Sports
  'Football': 'Futbol Topu',
  'Yoga Mat': 'Yoga Matı',
  'Dumbbell 5kg': 'Dambıl 5 kg',
  'City Bicycle': 'Şehir Bisikleti',

  // Books
  'Contemporary Novel': 'Güncel Roman',
  'Science Fiction': 'Bilim Kurgu',
  'Non-Fiction Bestseller': 'Kurgu Dışı Çok Satan',
  'Children Story Book': 'Çocuk Hikâye Kitabı',

  // Health and Beauty
  'Skincare Serum': 'Cilt Bakım Serumu',
  'Daily Shampoo': 'Günlük Şampuan',
  'Eau de Parfum': 'Parfüm (EDP)',
  'Hair Dryer': 'Saç Kurutma Makinesi',

  // Toys
  'Building Blocks Set': 'Yapı Blokları Seti',
  'Classic Doll': 'Klasik Oyuncak Bebek',
  'RC Car': 'Uzaktan Kumandalı Araba',
  'Puzzle 1000': 'Puzzle 1000 Parça',

  // Food
  'Premium Coffee Beans': 'Premium Kahve Çekirdeği',
  'Dark Chocolate': 'Bitter Çikolata',
  'Italian Pasta': 'İtalyan Makarna',
  'Extra Virgin Olive Oil': 'Sızma Zeytinyağı',
};

async function localize() {
  await connectDB();

  const products = await Product.find({});
  let updated = 0;

  for (const p of products) {
    const trName = nameMap[p.name as keyof typeof nameMap];
    if (!trName) continue;

    // İsim ve slug güncelle
    const newSlug = slugify(trName);
    p.name = trName;
    p.slug = newSlug;
    await p.save();
    updated += 1;
    console.log(`Updated: ${p._id} → ${trName}`);
  }

  console.log(`Localized ${updated} product names.`);
  process.exit(0);
}

localize().catch((err) => {
  console.error(err);
  process.exit(1);
});


