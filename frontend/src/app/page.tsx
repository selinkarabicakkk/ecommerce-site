import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';

export default function Home() {
  // Örnek öne çıkan kategoriler
  const featuredCategories = [
    { id: 1, name: 'Elektronik', image: '/images/categories/electronics.jpg', slug: 'electronics' },
    { id: 2, name: 'Giyim', image: '/images/categories/clothing.jpg', slug: 'clothing' },
    { id: 3, name: 'Ev ve Bahçe', image: '/images/categories/home-garden.jpg', slug: 'home-garden' },
    { id: 4, name: 'Spor', image: '/images/categories/sports.jpg', slug: 'sports' },
  ];

  // Örnek öne çıkan ürünler
  const featuredProducts = [
    {
      id: 1,
      name: 'Akıllı Telefon X',
      price: 9999.99,
      image: '/images/products/smartphone.jpg',
      slug: 'smartphone-x',
    },
    {
      id: 2,
      name: 'Laptop Pro',
      price: 14999.99,
      image: '/images/products/laptop.jpg',
      slug: 'laptop-pro',
    },
    {
      id: 3,
      name: 'Kablosuz Kulaklık',
      price: 1299.99,
      image: '/images/products/headphones.jpg',
      slug: 'wireless-headphones',
    },
    {
      id: 4,
      name: 'Akıllı Saat',
      price: 2499.99,
      image: '/images/products/smartwatch.jpg',
      slug: 'smart-watch',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Alışverişin Yeni Adresi
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Binlerce ürün, uygun fiyatlar ve hızlı teslimat ile online alışverişin keyfini çıkarın.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">
                <Link href="/products">Alışverişe Başla</Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/categories">Kategorileri Keşfet</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="relative h-64 md:h-80 lg:h-96 w-full">
              {/* Placeholder for hero image */}
              <div className="absolute inset-0 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Hero Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Popüler Kategoriler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 w-full bg-gray-200">
                  {/* Placeholder for category image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500">{category.name} Image</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline">
              <Link href="/categories">Tüm Kategoriler</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Öne Çıkan Ürünler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="relative h-48 w-full bg-gray-200">
                    {/* Placeholder for product image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-500">{product.name} Image</span>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 mt-1">{product.price.toLocaleString('tr-TR')} ₺</p>
                  <div className="mt-4">
                    <Button className="w-full">Sepete Ekle</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline">
              <Link href="/products">Tüm Ürünler</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Bültenimize Abone Olun</h2>
            <p className="text-lg text-gray-600 mb-8">
              En son ürünler, indirimler ve kampanyalardan haberdar olmak için bültenimize abone
              olun.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button>Abone Ol</Button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
