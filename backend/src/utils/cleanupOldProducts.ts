import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Product } from '../models';

dotenv.config();

async function cleanupOldProducts() {
  await connectDB();

  // Eski seed'de kullanılan düz dosya yolları (kategori klasörü olmadan)
  const legacyImagePaths = [
    '/images/products/tshirt.jpg',
    '/images/products/smartphone.jpg',
    '/images/products/laptop.jpg',
    '/images/products/jeans.jpg',
  ];

  // Sadece eski ürünleri, images içinde bu yolları içerenleri hedefliyoruz
  const result = await Product.deleteMany({ images: { $in: legacyImagePaths } });

  console.log(`Legacy products removed: ${result.deletedCount}`);
  process.exit(0);
}

cleanupOldProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});


