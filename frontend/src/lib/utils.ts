import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind sınıflarını birleştirmek için yardımcı fonksiyon
 * @param inputs - Birleştirilecek sınıflar
 * @returns Birleştirilmiş ve optimize edilmiş sınıf dizesi
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fiyatı biçimlendirmek için yardımcı fonksiyon
 * @param price - Biçimlendirilecek fiyat
 * @param currency - Para birimi (varsayılan: TRY)
 * @returns Biçimlendirilmiş fiyat dizesi
 */
export function formatPrice(price: number, currency: string = 'TRY') {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Tarihi biçimlendirmek için yardımcı fonksiyon
 * @param date - Biçimlendirilecek tarih
 * @returns Biçimlendirilmiş tarih dizesi
 */
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Metni kısaltmak için yardımcı fonksiyon
 * @param text - Kısaltılacak metin
 * @param maxLength - Maksimum uzunluk
 * @returns Kısaltılmış metin
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Slug oluşturmak için yardımcı fonksiyon
 * @param text - Slug'a dönüştürülecek metin
 * @returns Slug dizesi
 */
export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/[^\w\-]+/g, '') // Alfanümerik olmayan karakterleri kaldır
    .replace(/\-\-+/g, '-') // Birden fazla tireyi tek tire ile değiştir
    .replace(/^-+/, '') // Baştaki tireleri kaldır
    .replace(/-+$/, ''); // Sondaki tireleri kaldır
} 