'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10">
        {/* Başlık */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Hakkımızda</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ShopZone olarak amacımız, binlerce ürünü en iyi fiyat ve kullanıcı deneyimi ile buluşturmak. 
            Güvenli alışveriş, hızlı teslimat ve duyarlı destek ile her adımda yanınızdayız.
          </p>
        </section>

        {/* Sayılarla Biz */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="card p-6 text-center">
            <p className="text-3xl font-extrabold text-[rgb(var(--primary))]">500K+</p>
            <p className="text-gray-600 mt-1 text-sm">Mutlu Müşteri</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-3xl font-extrabold text-[rgb(var(--primary))]">50K+</p>
            <p className="text-gray-600 mt-1 text-sm">Ürün Çeşidi</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-3xl font-extrabold text-[rgb(var(--primary))]">1.5K+</p>
            <p className="text-gray-600 mt-1 text-sm">Marka</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-3xl font-extrabold text-[rgb(var(--primary))]">24/7</p>
            <p className="text-gray-600 mt-1 text-sm">Destek</p>
          </div>
        </section>

        {/* Neden Biz */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Neden Bizi Seçmelisiniz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Hızlı Teslimat', desc: 'Aynı gün kargo seçenekleri ve anlaşmalı kargo ağımız ile hızlı teslimat.' },
              { title: 'Güvenli Ödeme', desc: 'SSL korumalı sayfalar ve güvenilir ödeme altyapıları.' },
              { title: 'Kolay İade', desc: '14 gün içinde hızlı ve zahmetsiz iade süreci.' },
              { title: 'Müşteri Desteği', desc: '7/24 ulaşabileceğiniz, çözüm odaklı destek ekibi.' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Misyon & Vizyon */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-2">Misyonumuz</h3>
            <p className="text-gray-600">
              Geniş ürün yelpazesini herkes için erişilebilir ve güvenilir hale getirerek, kullanıcılarımıza 
              kusursuz bir alışveriş deneyimi sunmak.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-2">Vizyonumuz</h3>
            <p className="text-gray-600">
              Teknoloji ve veriyle güçlenen, kişiselleştirilmiş alışveriş önerileri sunan lider e‑ticaret markası olmak.
            </p>
          </div>
        </section>

        {/* Değerler */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Değerlerimiz</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Müşteri Odaklılık',
              'Şeffaflık',
              'Sürdürülebilirlik',
              'Sürekli İyileştirme',
              'Güven ve Güvenlik',
              'Çeşitlilik ve Dahil Etme',
            ].map((v) => (
              <li key={v} className="card p-4 text-sm text-gray-700">{v}</li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Sorunuz mu var?</h3>
            <p className="text-gray-600 text-sm">Destek ekibimiz size yardımcı olmaktan memnuniyet duyar.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/products">
              <Button>Alışverişe Başla</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">İletişime Geç</Button>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}


