import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Category } from '../models';

dotenv.config();

const trMap: Record<string, string> = {
  'Electronics': 'Elektronik',
  'Clothing': 'Giyim',
  'Home and Garden': 'Ev ve Bahçe',
  'Sports': 'Spor',
  'Books': 'Kitap',
  'Health and Beauty': 'Sağlık ve Güzellik',
  'Toys': 'Oyuncak',
  'Food': 'Gıda',
};

function slugifyTr(input: string): string {
  const map: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  const replaced = input
    .split('')
    .map((ch) => (map[ch] !== undefined ? map[ch] : ch))
    .join('');
  return replaced
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function localizeCategories() {
  await connectDB();

  const categories = await Category.find({});
  let updated = 0;

  for (const cat of categories) {
    const trName = trMap[cat.name as keyof typeof trMap];
    if (!trName) continue;

    const newSlug = slugifyTr(trName);
    cat.name = trName;
    cat.slug = newSlug;
    await cat.save();
    updated += 1;
    console.log(`Updated category: ${cat._id} → ${trName} (${newSlug})`);
  }

  console.log(`Localized ${updated} categories.`);
  process.exit(0);
}

localizeCategories().catch((err) => {
  console.error(err);
  process.exit(1);
});


