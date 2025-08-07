import { Request, Response } from 'express';
import { ApiError } from '../utils/errorUtils';
import WishlistItem from '../models/wishlistModel';
import Product from '../models/productModel';
import mongoose from 'mongoose';

// Kullanıcının istek listesini getir
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const wishlistItems = await WishlistItem.find({ user: userId })
      .populate({
        path: 'product',
        select: 'name price images slug',
      })
      .sort({ createdAt: -1 });

    // Ürün bilgilerini düzenle
    const formattedItems = wishlistItems.map(item => {
      const product = item.product as any;
      return {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : undefined,
          slug: product.slug,
        },
        user: item.user,
        createdAt: item.createdAt,
      };
    });

    res.status(200).json({
      data: formattedItems,
      totalCount: formattedItems.length,
    });
  } catch (error) {
    console.error('İstek listesi getirme hatası:', error);
    throw new ApiError('İstek listesi yüklenirken bir hata oluştu', 500);
  }
};

// Ürünü istek listesine ekle
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    // Ürünün var olup olmadığını kontrol et
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Ürün zaten istek listesinde mi kontrol et
    const existingItem = await WishlistItem.findOne({
      user: userId,
      product: productId,
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Bu ürün zaten istek listenizde' });
    }

    // Yeni istek listesi öğesi oluştur
    const wishlistItem = await WishlistItem.create({
      user: userId,
      product: productId,
    });

    res.status(201).json({
      message: 'Ürün istek listenize eklendi',
      data: wishlistItem,
    });
  } catch (error) {
    console.error('İstek listesine ekleme hatası:', error);
    
    // Duplicate key hatası (ürün zaten istek listesinde)
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: 'Geçersiz ürün ID\'si' });
    }
    
    throw new ApiError('Ürün istek listesine eklenirken bir hata oluştu', 500);
  }
};

// Ürünü istek listesinden çıkar
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const itemId = req.params.id;

    const deletedItem = await WishlistItem.findOneAndDelete({
      _id: itemId,
      user: userId,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: 'İstek listesi öğesi bulunamadı' });
    }

    res.status(200).json({
      message: 'Ürün istek listenizden kaldırıldı',
    });
  } catch (error) {
    console.error('İstek listesinden kaldırma hatası:', error);
    throw new ApiError('Ürün istek listesinden kaldırılırken bir hata oluştu', 500);
  }
};

// Ürünün istek listesinde olup olmadığını kontrol et
export const checkInWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const productId = req.params.productId;

    const wishlistItem = await WishlistItem.findOne({
      user: userId,
      product: productId,
    });

    res.status(200).json({
      inWishlist: !!wishlistItem,
      itemId: wishlistItem ? wishlistItem._id : undefined,
    });
  } catch (error) {
    console.error('İstek listesi kontrolü hatası:', error);
    throw new ApiError('İstek listesi kontrolü sırasında bir hata oluştu', 500);
  }
};

// İstek listesini temizle
export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    await WishlistItem.deleteMany({ user: userId });

    res.status(200).json({
      message: 'İstek listeniz temizlendi',
    });
  } catch (error) {
    console.error('İstek listesi temizleme hatası:', error);
    throw new ApiError('İstek listesi temizlenirken bir hata oluştu', 500);
  }
};