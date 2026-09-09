import { createClient } from '@supabase/supabase-js';
import { Product, PromoCode, ProductSizeVariant } from './types';

// بيانات الربط المباشرة مع مشروعك في Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ltiaxpdcvaphwbnadvrk.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_g1IC_Rb85whscbUJISBpCg_Xs2m9W43';
export const SUPABASE_JWKS_URL = 'https://ltiaxpdcvaphwbnadvrk.supabase.co/auth/v1/.well-known/jwks.json';

// عميل الربط مع قاعدة بيانات Supabase الحية لمتجر بقشة سعادة
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// جلب المنتجات الحقيقية كاملة من جدول products في Supabase (سريع وخفيف لتجنب انقطاع الشبكة)
export async function getStoreProducts(forceRefresh: boolean = false): Promise<Product[]> {
  const CACHE_KEY = 'bougshah_cached_products_v3';

  // تنظيف أي بيانات مؤقتة قديمة تم حفظها سابقاً
  try {
    localStorage.removeItem('bougshah_cached_products_v1');
    localStorage.removeItem('bougshah_cached_products_v2');
  } catch {
    // ignore
  }

  if (forceRefresh) {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, sku, name, category, buy_price, sell_price, stock, min_stock_alert, unit, sizes, has_sizes, created_at')
        .order('created_at', { ascending: false })
        .limit(400);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const rawProducts: Product[] = data.map((row: any) => {
          const category = (row.category || 'عام').trim();

          // استخراج المقاسات المسجلة فعلياً فقط في عمود sizes من جدول products في قاعدة البيانات
          let actualSizes: ProductSizeVariant[] = [];
          if (Array.isArray(row.sizes) && row.sizes.length > 0) {
            actualSizes = row.sizes.map((s: any, idx: number) => {
              if (typeof s === 'string') {
                return {
                  id: `sz-${idx}-${row.id}`,
                  name: s.trim(),
                  priceDelta: 0
                };
              }
              return {
                id: String(s.id || `sz-${idx}-${row.id}`),
                name: String(s.name || s.label || s.title || `مقاس ${idx + 1}`).trim(),
                priceDelta: Number(s.priceDelta || s.price_delta || s.price || 0),
                stock: typeof s.stock === 'number' ? s.stock : undefined,
                sku: s.sku || undefined,
                image_url: s.image_url || undefined
              };
            }).filter((s: ProductSizeVariant) => s.name.length > 0);
          } else if (typeof row.sizes === 'string' && row.sizes.trim().length > 0) {
            try {
              const parsed = JSON.parse(row.sizes);
              if (Array.isArray(parsed)) {
                actualSizes = parsed.map((s: any, idx: number) => {
                  if (typeof s === 'string') {
                    return {
                      id: `sz-${idx}-${row.id}`,
                      name: s.trim(),
                      priceDelta: 0
                    };
                  }
                  return {
                    id: String(s.id || `sz-${idx}-${row.id}`),
                    name: String(s.name || s.label || s.title || `مقاس ${idx + 1}`).trim(),
                    priceDelta: Number(s.priceDelta || s.price_delta || s.price || 0),
                    stock: typeof s.stock === 'number' ? s.stock : undefined,
                    sku: s.sku || undefined,
                    image_url: s.image_url || undefined
                  };
                }).filter((s: ProductSizeVariant) => s.name.length > 0);
              }
            } catch {
              // ignore json parse error
            }
          }

          // اعتماد المقاسات فقط وحصراً في حال كانت مسجلة فعلياً في قاعدة البيانات
          const hasDbSizes = Boolean(actualSizes.length > 0);

          return {
            id: String(row.id),
            sku: row.sku || '',
            name: row.name || 'منتج',
            category,
            buy_price: Number(row.buy_price || 0),
            sell_price: Number(row.sell_price || 0),
            stock: Number(row.stock || 0),
            min_stock_alert: Number(row.min_stock_alert || 5),
            unit: row.unit || 'حبة',
            image_url: undefined,
            images: [],
            description: `قسم ${category}`,
            hasSizes: hasDbSizes,
            sizes: actualSizes,
            created_at: row.created_at
          };
        });

        // المنتجات الفعلية كما هي من قاعدة البيانات دون أي اختلاق مقاسات
        const products: Product[] = rawProducts;

        // حفظ نسخة محلية لضمان عمل المتجر دائماً حتى لو تعثرت الشبكة لاحقاً
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(products));
        } catch {
          // تجاوز قيود التخزين
        }

        return products;
      }
    } catch (err: any) {
      console.warn(`Supabase products fetch attempt ${attempt} warning:`, err?.message || err);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }

  // في حال تعذر الاتصال تماماً، استخدام النسخة الاحتياطية من التخزين المحلي
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.info('تم استعادة المنتجات من التخزين المحلي لضمان استمرارية المتجر');
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * جلب الصور الحقيقية المخزنة في قاعدة البيانات على دفعات ذكية وتحديثها تدريجياً
 * هذا يمنع أي بطء أو انقطاع في الاتصال بسبب أحجام الصور الكبيرة (Base64)
 */
export async function loadRealProductImages(
  onBatchLoaded: (imagesMap: Record<string, { image_url?: string; images: string[] }>) => void
): Promise<void> {
  try {
    // 1. جلب معرفات المنتجات التي تمتلك صوراً فعلية سواء في image_url أو images
    const { data: idRows, error: idErr } = await supabase
      .from('products')
      .select('id')
      .or('image_url.not.is.null,images.not.is.null')
      .limit(300);

    if (idErr || !idRows || idRows.length === 0) {
      return;
    }

    const allIds = idRows.map((r: any) => r.id);
    const BATCH_SIZE = 5;

    // 2. طلب الصور بدفعات خفيفة مع فاصل زمني لتجنب إغراق متصفح العميل بالبيانات
    for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
      const batchIds = allIds.slice(i, i + BATCH_SIZE);
      try {
        const { data: imgData, error: imgErr } = await supabase
          .from('products')
          .select('id, image_url, images')
          .in('id', batchIds);

        if (!imgErr && imgData && imgData.length > 0) {
          const map: Record<string, { image_url?: string; images: string[] }> = {};
          imgData.forEach((row: any) => {
            const list: string[] = [];
            if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim().length > 10) {
              list.push(row.image_url.trim());
            }
            if (Array.isArray(row.images)) {
              row.images.forEach((img: any) => {
                if (typeof img === 'string' && img.trim().length > 10 && !list.includes(img.trim())) {
                  list.push(img.trim());
                }
              });
            }

            if (list.length > 0) {
              map[row.id] = {
                image_url: list[0],
                images: list
              };
            }
          });

          if (Object.keys(map).length > 0) {
            onBatchLoaded(map);
          }
        }
      } catch (bErr) {
        console.warn('Batch image load issue:', bErr);
      }

      // فاصل زمني صغير لمنح المتصفح أريحية في المعالجة والرسم
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  } catch (err) {
    console.warn('Real product images progressive loader notice:', err);
  }
}

/**
 * جلب تفاصيل وصور المنتج الحقيقية من Supabase لحظياً عند فتح النافذة
 * لضمان عرض جميع الصور المتوفرة وصور المقاسات بأقصى سرعة
 */
export async function fetchProductDetails(
  productId: string,
  variantIds: string[] = []
): Promise<{
  image_url?: string;
  images: string[];
  sizesImages?: Record<string, string>;
}> {
  try {
    const ids = Array.from(new Set([productId, ...variantIds].filter(Boolean)));
    if (ids.length === 0) return { images: [] };

    const { data, error } = await supabase
      .from('products')
      .select('id, image_url, images')
      .in('id', ids);

    if (error || !data || data.length === 0) {
      return { images: [] };
    }

    const images: string[] = [];
    const sizesImages: Record<string, string> = {};
    let mainImageUrl: string | undefined = undefined;

    data.forEach((row: any) => {
      let rowFirstImg: string | undefined = undefined;
      if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim().length > 10) {
        const u = row.image_url.trim();
        rowFirstImg = u;
        if (!images.includes(u)) images.push(u);
      }
      if (Array.isArray(row.images)) {
        row.images.forEach((img: any) => {
          if (typeof img === 'string' && img.trim().length > 10 && !images.includes(img.trim())) {
            if (!rowFirstImg) rowFirstImg = img.trim();
            images.push(img.trim());
          }
        });
      }
      if (row.id === productId && rowFirstImg) {
        mainImageUrl = rowFirstImg;
      }
      if (rowFirstImg) {
        sizesImages[row.id] = rowFirstImg;
      }
    });

    return {
      image_url: mainImageUrl || (images.length > 0 ? images[0] : undefined),
      images,
      sizesImages
    };
  } catch (err) {
    console.warn('fetchProductDetails notice:', err);
    return { images: [] };
  }
}

// جلب كوبونات الخصم الحقيقية من جدول promo_codes (دون أي بيانات افتراضية)
export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .limit(30);

    if (error) {
      console.warn('Supabase promo codes notice:', error.message || error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
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
