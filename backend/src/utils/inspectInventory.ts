import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Product, Category } from '../models';

dotenv.config();

async function inspect() {
  await connectDB();

  // Count products per category
  const grouped = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
    { $unwind: '$cat' },
    { $project: { _id: 0, category: '$cat.name', slug: '$cat.slug', count: 1 } },
    { $sort: { category: 1 } },
  ]);

  console.log('Counts by category:');
  grouped.forEach((g: any) => console.log(`- ${g.category} (${g.slug}): ${g.count}`));

  const legacy = await Product.find({
    name: { $regex: /(laptop|smartphone|t\s?shirt|jeans)/i },
  }).select('name slug images');

  console.log('\nProducts matching laptop/smartphone/tshirt/jeans:');
  legacy.forEach((p) => console.log(`- ${p.name} [${p.slug}] => ${p.images?.join(', ')}`));

  process.exit(0);
}

inspect().catch((e) => {
  console.error(e);
  process.exit(1);
});


