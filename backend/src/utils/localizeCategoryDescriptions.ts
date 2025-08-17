import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Category } from '../models';

dotenv.config();

// Kategori ad(ları) → Türkçe açıklama eşlemesi
const trDescriptions: Record<string, string> = {
  // English keys
  'Electronics': 'Elektronik cihazlar ve aksesuarlar.',
  'Clothing': 'Tişört, pantolon ve diğer giyim ürünleri.',
  'Home and Garden': 'Mobilya, dekor ve bahçe ürünleri.',
  'Sports': 'Spor ekipmanları ve aktif giyim.',
  'Books': 'Roman, kurgu dışı ve eğitim kitapları.',
  'Health and Beauty': 'Kişisel bakım ürünleri ve kozmetik.',
  'Toys': 'Tüm yaş grupları için oyuncaklar.',
  'Food': 'Gıda ve gurme ürünler.',
  // Turkish keys
  'Elektronik': 'Elektronik cihazlar ve aksesuarlar.',
  'Giyim': 'Tişört, pantolon ve diğer giyim ürünleri.',
  'Ev ve Bahçe': 'Mobilya, dekor ve bahçe ürünleri.',
  'Spor': 'Spor ekipmanları ve aktif giyim.',
  'Kitap': 'Roman, kurgu dışı ve eğitim kitapları.',
  'Sağlık ve Güzellik': 'Kişisel bakım ürünleri ve kozmetik.',
  'Oyuncak': 'Tüm yaş grupları için oyuncaklar.',
  'Gıda': 'Gıda ve gurme ürünler.',
};

async function localizeCategoryDescriptions() {
  await connectDB();

  const categories = await Category.find({});
  let updated = 0;

  for (const cat of categories) {
    const nextDesc = trDescriptions[cat.name as keyof typeof trDescriptions];
    if (!nextDesc) continue;
    if (cat.description === nextDesc) continue;

    cat.description = nextDesc;
    await cat.save();
    updated += 1;
    console.log(`Updated description: ${cat.name}`);
  }

  console.log(`Localized descriptions for ${updated} categories.`);
  process.exit(0);
}

localizeCategoryDescriptions().catch((err) => {
  console.error(err);
  process.exit(1);
});


