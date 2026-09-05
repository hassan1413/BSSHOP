import { createClient } from '@supabase/supabase-js';
import { Product, PromoCode } from './types';

// بيانات الربط المباشرة مع مشروعك في Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ltiaxpdcvaphwbnadvrk.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_g1IC_Rb85whscbUJISBpCg_Xs2m9W43';
export const SUPABASE_JWKS_URL = 'https://ltiaxpdcvaphwbnadvrk.supabase.co/auth/v1/.well-known/jwks.json';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// صور راقية بديلة بحسب تصنيفات متجر بقشة سعادة في حال عدم وجود صورة للمنتج
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'بديل الذهب': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
  'فضيات': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  'اكسسوارات': 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=600&auto=format&fit=crop',
  'شنط': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop',
  'الألعاب': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop',
  'عناية': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
  'مناسبات': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=600&auto=format&fit=crop',
  'هدايا': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop',
  'كماليات ومنزل': 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=600&auto=format&fit=crop',
  'بوكسات هدايا': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'
};

export const DEFAULT_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop';

export function getProductImage(category: string, rawUrl?: string | null): string {
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 5) {
    return rawUrl.trim();
  }
  return CATEGORY_FALLBACK_IMAGES[category] || DEFAULT_PLACEHOLDER_IMAGE;
}

// قائمة منتجات نموذجية احترافية تدعم المتجر وتمنع توقفه عند أي تأخير بالخادم
export const DEFAULT_FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-fallback-1',
    sku: 'G017',
    name: 'حلق بديل الذهب فاخر مرصع بالزركون',
    category: 'بديل الذهب',
    buy_price: 5,
    sell_price: 15,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    description: 'حلق مطلي بديل الذهب عيار فاخر ببريق يدوم طويلاً وتصميم كلاسيكي جذاب.',
    hasSizes: false
  },
  {
    id: 'prod-fallback-2',
    sku: 'F006',
    name: 'طقم زيركون طبقتين من الفضة النقية',
    category: 'فضيات',
    buy_price: 25,
    sell_price: 55,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    description: 'طقم فضيات متكامل من طبقتين بتطريز كريستالي ساحر مع علبة قطيفة.',
    hasSizes: false
  },
  {
    id: 'prod-fallback-3',
    sku: '062',
    name: 'تاج كرستال مع تاكه أنيقة للمناسبات',
    category: 'اكسسوارات',
    buy_price: 3,
    sell_price: 12,
    stock: 24,
    image_url: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=600&auto=format&fit=crop',
    description: 'تاج شعر كريستالي لامع مناسب للأفراح والمناسبات السعيدة.',
    hasSizes: false
  },
  {
    id: 'prod-fallback-4',
    sku: 'G054',
    name: 'طقم بناجر هندية بديل الذهب نقش ليزر',
    category: 'بديل الذهب',
    buy_price: 8,
    sell_price: 24,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1611591475155-4286fa7c2e7f?q=80&w=600&auto=format&fit=crop',
    description: 'بناجر أنيقة بنقش خليجي هندي متقن بلمعان ذهبي يخطف الأنظار.',
    hasSizes: false
  },
  {
    id: 'prod-fallback-5',
    sku: 'BOK-001',
    name: 'بوكس السعادة - شوكولاتة وورد وكرت إهداء',
    category: 'هدايا',
    buy_price: 60,
    sell_price: 120,
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop',
    description: 'بوكس متكامل مغلف بالساتان مع تشكيلة شوكولاتة فاخرة وميني ورد طبيعي.',
    hasSizes: true,
    sizes: [
      { id: 'sz-1', name: 'الحجم العادي', priceDelta: 0, stock: 6 },
      { id: 'sz-2', name: 'الحجم الملكي الكبير', priceDelta: 45, stock: 4 }
    ]
  },
  {
    id: 'prod-fallback-6',
    sku: 'SH-01',
    name: 'شنطة يد ناعمة بتطريز رقيق وسلسال ذهبي',
    category: 'شنط',
    buy_price: 30,
    sell_price: 65,
    stock: 14,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop',
    description: 'شنطة أنيقة متناسقة مع الملابس اليومية ومناسبات المساء.',
    hasSizes: false
  },
  {
    id: 'prod-fallback-7',
    sku: 'TOY-01',
    name: 'دمية دب لطيف مخملي مع فيونكة حمراء',
    category: 'الألعاب',
    buy_price: 15,
    sell_price: 35,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop',
    description: 'دمية ناعمة جداً وآمنة للأطفال للإهداء في المناسبات السعيدة.',
    hasSizes: false
  },
  {
    id: 'prod-fallback-8',
    sku: 'CARE-01',
    name: 'مجموعة العناية الفاخرة - لوشن وعطر ميني',
    category: 'عناية',
    buy_price: 20,
    sell_price: 48,
    stock: 16,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    description: 'مجموعة عناية طبيعية برائحة المسك والزهور لترطيب ونعومة فائقة.',
    hasSizes: false
  }
];

// جلب المنتجات الحية من جدول products في Supabase بسرعة ودون تجاوز وقت الخادم
export async function getStoreProducts(): Promise<Product[]> {
  try {
    // استعلام سريع محدد الأعمدة والعدد لتفادي statement timeout
    const { data, error } = await supabase
      .from('products')
      .select('id, sku, name, category, buy_price, sell_price, stock, min_stock_alert, unit, image_url, images, created_at')
      .limit(60);

    if (error) {
      console.warn('Supabase products fetch notice (using backup data):', error.message || error);
      return DEFAULT_FALLBACK_PRODUCTS;
    }

    if (!data || data.length === 0) {
      return DEFAULT_FALLBACK_PRODUCTS;
    }

    return data.map((row: any) => {
      const category = (row.category || 'عام').trim();
      const finalImage = getProductImage(category, row.image_url);

      return {
        id: String(row.id),
        sku: row.sku || '',
        name: row.name || 'منتج بدون اسم',
        category,
        buy_price: Number(row.buy_price || 0),
        sell_price: Number(row.sell_price || 0),
        stock: Number(row.stock || 0),
        min_stock_alert: Number(row.min_stock_alert || 0),
        unit: row.unit || 'حبة',
        image_url: finalImage,
        images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [finalImage],
        description: row.name ? `منتج مميز من قسم ${category} لدى متجر بقشة سعادة.` : '',
        hasSizes: false,
        sizes: []
      };
    });
  } catch (err) {
    console.warn('Supabase fetch products network catch:', err);
    return DEFAULT_FALLBACK_PRODUCTS;
  }
}

// جلب كوبونات الخصم الحية من جدول promo_codes
export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .limit(20);

    if (error) {
      console.warn('Supabase promo codes notice:', error.message || error);
      return [
        { id: 'promo-def-1', code: 'SAADA10', type: 'percent', value: 10, is_active: true },
        { id: 'promo-def-2', code: 'SH', type: 'percent', value: 10, is_active: true }
      ];
    }

    if (!data || data.length === 0) {
      return [
        { id: 'promo-def-1', code: 'SAADA10', type: 'percent', value: 10, is_active: true }
      ];
    }

    return data.map((row: any) => ({
      id: String(row.id),
      code: String(row.code || '').trim(),
      type: row.type === 'percent' ? 'percent' : row.type === 'percentage' ? 'percentage' : 'fixed',
      value: Number(row.value || 0),
      usage_limit: row.usage_limit ? Number(row.usage_limit) : undefined,
      times_used: row.times_used ? Number(row.times_used) : 0,
      is_active: Boolean(row.is_active),
      expires_at: row.expires_at || undefined
    }));
  } catch (err) {
    console.warn('Could not fetch promo codes:', err);
    return [];
  }
}

// إرسال طلب جديد إلى جدول الفواتير (invoices) في Supabase
export async function submitCustomerOrder(orderPayload: {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  items: any[];
  totalAmount: number;
  discount: number;
}) {
  const shortId = Date.now().toString().slice(-6);
  const orderNumber = `INV-ONLINE-${shortId}`;
  const today = new Date().toISOString().split('T')[0];

  const formattedItems = orderPayload.items.map((item) => ({
    id: `item-${Date.now()}-${item.productId}`,
    productId: item.productId,
    sku: item.sku || '',
    name: item.name,
    description: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
    total: item.price * item.quantity,
    selected_size: item.selectedSize?.name || null
  }));

  const invoiceRecord = {
    id: `inv-online-${Date.now()}`,
    invoice_number: orderNumber,
    customer_name: orderPayload.customerName,
    customer_tax_number: null,
    date: today,
    due_date: today,
    items: formattedItems,
    subtotal: Number((orderPayload.totalAmount + orderPayload.discount).toFixed(2)),
    tax_amount: 0,
    total_amount: Number(orderPayload.totalAmount.toFixed(2)),
    status: 'pending', // في انتظار تجهيز وتأكيد الموظف
    notes: `طلب متجر أونلاين (المتجر الإلكتروني) | الجوال: ${orderPayload.customerPhone} | العنوان: ${orderPayload.deliveryAddress || 'استلام من الفرع'} | الملاحظات: ${orderPayload.notes || 'لا يوجد'}`,
    payment_method: 'store_pickup',
    cashier_name: 'متجر أونلاين',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceRecord])
      .select();

    if (error) {
      console.error('Supabase invoice insert error:', error);
      return { orderNumber, data: invoiceRecord, error };
    }

    const savedRecord = data?.[0] || invoiceRecord;

    // إرسال إشعار بث لحظي عبر قنوات Supabase Realtime لإيقاظ وتنبيه الموقع الأساسي فوراً
    try {
      const broadcastChannel = supabase.channel('online_orders');
      broadcastChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          broadcastChannel.send({
            type: 'broadcast',
            event: 'new_order',
            payload: savedRecord
          });
          broadcastChannel.send({
            type: 'broadcast',
            event: 'NEW_ONLINE_ORDER',
            payload: savedRecord
          });
        }
      });

      // بث على قناة invoices العامة
      const invChannel = supabase.channel('invoices_channel');
      invChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          invChannel.send({
            type: 'broadcast',
            event: 'invoice_created',
            payload: savedRecord
          });
        }
      });
    } catch (bcErr) {
      console.warn('Realtime broadcast notice:', bcErr);
    }

    return { orderNumber, data: savedRecord, error: null };
  } catch (err) {
    console.error('Invoice network error:', err);
    return { orderNumber, data: invoiceRecord, error: err };
  }
}

// الاستماع للتحديثات اللحظية على المنتجات
export function subscribeToProductUpdates(callback: () => void) {
  try {
    let lastCall = 0;
    const throttledCallback = () => {
      const now = Date.now();
      if (now - lastCall > 5000) {
        lastCall = now;
        callback();
      }
    };

    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, throttledCallback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}
