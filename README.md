# E-Ticaret Platformu

Bu proje, modern bir e-ticaret platformu geliştirme case study'sidir.

## Teknoloji Yığını

### Frontend

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Redux Toolkit (State Management)
- React Hook Form + Zod (Form Validation)
- Özel UI Bileşenleri

### Backend

- Node.js 18+ ve Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Multer (Dosya Yükleme)
- Zod (Validation)
- Nodemailer
- bcrypt ve CORS

## Özellikler

### Müşteri Özellikleri

- Ana Sayfa (Hero bölümü, öne çıkan ürünler, kategoriler)
- Ürün Listeleme ve Filtreleme
- Ürün Detay Sayfaları
- Kullanıcı Hesabı (Kayıt, Giriş, Profil)
- Alışveriş Sepeti ve Ödeme İşlemi
- Ürün İnceleme Sistemi

### Admin Özellikleri

- Admin Dashboard
- Ürün Yönetimi
- Müşteri Yönetimi
- Kategori Yönetimi

### Öneri Sistemi

- Ana sayfada popüler ürünler
- Ürün sayfalarında ilgili ürünler
- Kullanıcı gezinme geçmişine göre öneriler
- "Birlikte sıkça alınanlar" önerileri

## Kurulum

### Gereksinimler

- Node.js 18 veya üzeri
- MongoDB (yerel veya uzak)
- npm veya yarn

### Backend Kurulumu

1. Backend klasörüne gidin:

   ```
   cd backend
   ```

2. Bağımlılıkları yükleyin:

   ```
   npm install
   ```

3. `.env` dosyasını oluşturun (örnek için `.env.example` dosyasını kullanabilirsiniz):

   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   EMAIL_FROM=noreply@ecommerce.com
   UPLOAD_PATH=uploads/
   MAX_FILE_SIZE=5242880
   FRONTEND_URL=http://localhost:3000
   ```

4. Veritabanını örnek verilerle doldurun:

   ```
   npm run seed
   ```

5. Sunucuyu başlatın:
   ```
   npm run dev
   ```

### Frontend Kurulumu

1. Frontend klasörüne gidin:

   ```
   cd frontend
   ```

2. Bağımlılıkları yükleyin:

   ```
   npm install
   ```

3. `.env.local` dosyasını oluşturun:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Geliştirme sunucusunu başlatın:
   ```
   npm run dev
   ```

## API Uç Noktaları

### Kimlik Doğrulama

- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/verify-email` - Email doğrulama
- `POST /api/auth/forgot-password` - Şifremi unuttum
- `POST /api/auth/reset-password` - Şifre sıfırlama
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Ürünler

- `GET /api/products` - Tüm ürünleri getir (filtreleme, sıralama ve sayfalama destekler)
- `GET /api/products/:id` - ID'ye göre ürün getir
- `GET /api/products/slug/:slug` - Slug'a göre ürün getir
- `GET /api/products/top` - En çok puan alan ürünleri getir
- `GET /api/products/featured` - Öne çıkan ürünleri getir
- `GET /api/products/new` - Yeni gelen ürünleri getir
- `GET /api/products/:id/related` - İlgili ürünleri getir
- `POST /api/products` - Yeni ürün ekle (Admin)
- `PUT /api/products/:id` - Ürün güncelle (Admin)
- `DELETE /api/products/:id` - Ürün sil (Admin)

### Kategoriler

- `GET /api/categories` - Tüm kategorileri getir
- `GET /api/categories/:id` - ID'ye göre kategori getir
- `GET /api/categories/slug/:slug` - Slug'a göre kategori getir
- `POST /api/categories` - Yeni kategori ekle (Admin)
- `PUT /api/categories/:id` - Kategori güncelle (Admin)
- `DELETE /api/categories/:id` - Kategori sil (Admin)

### Sepet

- `GET /api/cart` - Kullanıcının sepetini getir
- `POST /api/cart` - Sepete ürün ekle
- `PUT /api/cart/:itemId` - Sepetteki ürünü güncelle
- `DELETE /api/cart/:itemId` - Sepetten ürün çıkar
- `DELETE /api/cart` - Sepeti temizle

### Siparişler

- `POST /api/orders` - Sipariş oluştur
- `GET /api/orders/myorders` - Kullanıcının siparişlerini getir
- `GET /api/orders/:id` - ID'ye göre sipariş getir
- `PUT /api/orders/:id/pay` - Siparişi ödenmiş olarak işaretle
- `PUT /api/orders/:id/status` - Sipariş durumunu güncelle (Admin)
- `GET /api/orders` - Tüm siparişleri getir (Admin)

### İncelemeler

- `GET /api/reviews` - Tüm incelemeler (onaylanmış)
- `GET /api/reviews/product/:productId` - Ürüne göre incelemeler
- `POST /api/reviews` - İnceleme ekle
- `PUT /api/reviews/:id` - İnceleme güncelle
- `DELETE /api/reviews/:id` - İnceleme sil
- `PUT /api/reviews/:id/approve` - İnceleme onayla (Admin)

### Öneri Sistemi

- `POST /api/activity` - Kullanıcı etkinliği kaydet
- `GET /api/activity/popular` - Popüler ürünleri getir
- `GET /api/activity/recommendations` - Kullanıcıya özel öneriler getir
- `GET /api/activity/frequently-bought-together/:productId` - Birlikte sıkça alınan ürünleri getir

### Kullanıcı

- `GET /api/users/profile` - Kullanıcı profilini getir
- `PUT /api/users/profile` - Kullanıcı profilini güncelle
- `POST /api/users/addresses` - Adres ekle
- `PUT /api/users/addresses/:addressId` - Adres güncelle
- `DELETE /api/users/addresses/:addressId` - Adres sil
- `PUT /api/users/favorite-categories` - Favori kategorileri güncelle

## Demo Hesapları

### Admin Hesabı

- Email: admin@example.com
- Şifre: 123456

### Müşteri Hesabı

- Email: john@example.com
- Şifre: 123456

## Geliştirme

### Dizin Yapısı

```
/
├── backend/               # Backend kodu
│   ├── src/               # Kaynak kodları
│   │   ├── config/        # Yapılandırma dosyaları
│   │   ├── controllers/   # API kontrolörleri
│   │   ├── middlewares/   # Ara yazılımlar
│   │   ├── models/        # Veritabanı modelleri
│   │   ├── routes/        # API rotaları
│   │   ├── utils/         # Yardımcı fonksiyonlar
│   │   └── validations/   # Doğrulama şemaları
│   └── uploads/           # Yüklenen dosyalar
├── frontend/              # Frontend kodu
│   ├── public/            # Statik dosyalar
│   └── src/               # Kaynak kodları
│       ├── app/           # Next.js sayfa bileşenleri
│       ├── components/    # Yeniden kullanılabilir bileşenler
│       ├── hooks/         # Özel React hook'ları
│       ├── lib/           # Yardımcı fonksiyonlar
│       ├── services/      # API servisleri
│       ├── store/         # Redux store
│       └── types/         # TypeScript tipleri
└── docs/                  # Dokümantasyon
```

### Eksik Bileşenler ve Geliştirme Gereksinimleri

Projenin mevcut durumunda eksik olan bileşenler ve geliştirilmesi gereken özellikler için `eksik-bilesenler.md` dosyasına bakabilirsiniz.

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme (minimum 6 karakter)
- Giriş denemeleri için rate limiting
- XSS saldırılarına karşı input sanitizasyonu
- Güvenli dosya yükleme (dosya türü ve boyut doğrulama)
- CORS yapılandırması

## Performans Optimizasyonları

- Next.js Image bileşeni ile görsel optimizasyonu
- Lazy loading ile daha iyi performans
- Önbelleğe alma stratejileri
- Sayfa yükleme durumları ve hata işleme

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
