import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Category, Product } from '../models';
import { hashPassword } from './passwordUtils';
import connectDB from '../config/db';

// Load environment variables
dotenv.config();

// Sample data
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    isEmailVerified: true,
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    isEmailVerified: true,
  },
];

const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    image: '/images/categories/electronics.jpg',
    slug: 'electronics',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Clothing',
    description: 'Shirts, pants, and other apparel',
    image: '/images/categories/clothing.jpg',
    slug: 'clothing',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Home and Garden',
    description: 'Furniture, decor, and gardening supplies',
    image: '/images/categories/home-garden.jpg',
    slug: 'home-and-garden',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Sports',
    description: 'Sports equipment and activewear',
    image: '/images/categories/sports.jpg',
    slug: 'sports',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'Books',
    description: 'Fiction, non-fiction, and educational books',
    image: '/images/categories/books.jpg',
    slug: 'books',
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'Health and Beauty',
    description: 'Personal care products and cosmetics',
    image: '/images/categories/health-beauty.jpg',
    slug: 'health-and-beauty',
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'Toys',
    description: 'Toys for children of all ages',
    image: '/images/categories/toys.jpg',
    slug: 'toys',
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'Food',
    description: 'Groceries and specialty food items',
    image: '/images/categories/food.jpg',
    slug: 'food',
    isActive: true,
    sortOrder: 8,
  },
];

// Function to seed data
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Data cleared...');

    // Create users with hashed passwords
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await hashPassword(user.password);
        return User.create({
          ...user,
          password: hashedPassword,
        });
      })
    );

    console.log(`${createdUsers.length} users created`);

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created`);

    // Create sample products for each category
    const sampleProducts = [];

    // Electronics products
    const electronicsCategory = createdCategories.find(
      (cat) => cat.name === 'Electronics'
    );
    if (electronicsCategory) {
      sampleProducts.push(
        {
          name: 'Smartphone X',
          description: 'Latest smartphone with advanced features',
          price: 999.99,
          category: electronicsCategory._id,
          images: ['/images/products/smartphone.jpg'],
          specifications: {
            'Screen Size': '6.5 inches',
            'Storage': '128GB',
            'RAM': '8GB',
            'Camera': '48MP',
          },
          tags: ['smartphone', 'mobile', 'tech'],
          isFeatured: true,
          stock: 50,
          sku: 'ELEC-001',
          slug: 'smartphone-x',
        },
        {
          name: 'Laptop Pro',
          description: 'High-performance laptop for professionals',
          price: 1499.99,
          category: electronicsCategory._id,
          images: ['/images/products/laptop.jpg'],
          specifications: {
            'Screen Size': '15.6 inches',
            'Storage': '512GB SSD',
            'RAM': '16GB',
            'Processor': 'Intel Core i7',
          },
          tags: ['laptop', 'computer', 'tech'],
          isFeatured: true,
          stock: 30,
          sku: 'ELEC-002',
          slug: 'laptop-pro',
        }
      );
    }

    // Clothing products
    const clothingCategory = createdCategories.find(
      (cat) => cat.name === 'Clothing'
    );
    if (clothingCategory) {
      sampleProducts.push(
        {
          name: 'Classic T-Shirt',
          description: 'Comfortable cotton t-shirt for everyday wear',
          price: 19.99,
          category: clothingCategory._id,
          images: ['/images/products/tshirt.jpg'],
          specifications: {
            'Material': '100% Cotton',
            'Fit': 'Regular',
          },
          tags: ['tshirt', 'casual', 'clothing'],
          isFeatured: false,
          stock: 100,
          sku: 'CLOTH-001',
          slug: 'classic-t-shirt',
          variants: [
            {
              name: 'Size',
              options: [
                {
                  value: 'S',
                  price: 19.99,
                  stock: 30,
                  sku: 'CLOTH-001-S',
                },
                {
                  value: 'M',
                  price: 19.99,
                  stock: 40,
                  sku: 'CLOTH-001-M',
                },
                {
                  value: 'L',
                  price: 19.99,
                  stock: 30,
                  sku: 'CLOTH-001-L',
                },
              ],
            },
            {
              name: 'Color',
              options: [
                {
                  value: 'Black',
                  price: 19.99,
                  stock: 50,
                  sku: 'CLOTH-001-BLK',
                },
                {
                  value: 'White',
                  price: 19.99,
                  stock: 50,
                  sku: 'CLOTH-001-WHT',
                },
              ],
            },
          ],
        },
        {
          name: 'Denim Jeans',
          description: 'Classic denim jeans with straight fit',
          price: 49.99,
          category: clothingCategory._id,
          images: ['/images/products/jeans.jpg'],
          specifications: {
            'Material': 'Denim',
            'Fit': 'Straight',
          },
          tags: ['jeans', 'denim', 'clothing'],
          isFeatured: true,
          stock: 80,
          sku: 'CLOTH-002',
          slug: 'denim-jeans',
        }
      );
    }

    // Create products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`${createdProducts.length} products created`);

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

// Run seeder
seedData(); 