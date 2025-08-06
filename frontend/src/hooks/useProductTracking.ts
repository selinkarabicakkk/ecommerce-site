import { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { activityService } from '@/services';

/**
 * Ürün görüntüleme ve etkileşimlerini takip etmek için hook
 * 
 * @param productId - Takip edilecek ürünün ID'si
 * @param activityType - Etkinlik türü ('view', 'cart', 'wishlist', 'purchase')
 * @param skipTracking - Takibi atlama seçeneği (isteğe bağlı)
 */
export const useProductTracking = (
  productId: string | undefined,
  activityType: 'view' | 'cart' | 'wishlist' | 'purchase',
  skipTracking: boolean = false
) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Ürün ID yoksa, kullanıcı giriş yapmamışsa veya takip atlanacaksa işlem yapma
    if (!productId || !isAuthenticated || skipTracking) {
      return;
    }

    // Etkinliği kaydet
    const logActivity = async () => {
      try {
        await activityService.logActivity({
          productId,
          activityType,
        });
      } catch (error) {
        // Hata durumunda sessizce devam et
        console.error('Etkinlik kaydedilirken hata oluştu:', error);
      }
    };

    // Görüntüleme etkinliği için hemen kaydet
    if (activityType === 'view') {
      logActivity();
    }

    // Diğer etkinlik türleri için (sepet, favoriler, satın alma) fonksiyonu dışarı çıkar
    return () => {
      // Component unmount olduğunda bir şey yapma
    };
  }, [productId, activityType, isAuthenticated, skipTracking]);

  // Sepet, favoriler ve satın alma işlemleri için manuel olarak çağrılabilecek fonksiyon
  const trackActivity = async () => {
    if (!productId || !isAuthenticated || skipTracking) {
      return;
    }

    try {
      await activityService.logActivity({
        productId,
        activityType,
      });
    } catch (error) {
      console.error('Etkinlik kaydedilirken hata oluştu:', error);
    }
  };

  return { trackActivity };
};

export default useProductTracking;