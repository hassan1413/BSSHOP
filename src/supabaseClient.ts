import { createClient } from '@supabase/supabase-js';
import { Product, PromoCode } from './types';

// بيانات الربط المباشرة مع مشروعك في Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ltiaxpdcvaphwbnadvrk.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_g1IC_Rb85whscbUJISBpCg_Xs2m9W43';
export const SUPABASE_JWKS_URL = 'https://ltiaxpdcvaphwbnadvrk.supabase.co/auth/v1/.well-known/jwks.json';

// عميل الربط مع قاعدة بيانات Supabase الحية لمتجر بقشة سعادة
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// جلب المنتجات الحقيقية كاملة من جدول products في Supabase (دون أي بيانات افتراضية)
export async function getStoreProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, sku, name, category, buy_price, sell_price, stock, min_stock_alert, unit, created_at')
      .order('created_at', { ascending: false })
      .limit(400);

    if (error) {
      console.error('Supabase products fetch error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => {
      const category = (row.category || 'عام').trim();

      return {
        id: String(row.id),
        sku: row.sku || '',
        name: row.name || 'منتج',
        category,
        buy_price: Number(row.buy_price || 0),
        sell_price: Number(row.sell_price || 0),
        stock: Number(row.stock || 0),
        min_stock_alert: Number(row.min_stock_alert || 0),
        unit: row.unit || 'حبة',
        image_url: undefined, // سيتم جلب الصور الحقيقية المخزنة بقاعدة البيانات تدريجياً
        images: [],
        description: `قسم ${category}`,
        hasSizes: false,
        sizes: [],
        created_at: row.created_at
      };
    });
  } catch (err) {
    console.error('Supabase fetch products network catch:', err);
    return [];
  }
}

/**
 * جلب الصور الحقيقية المخزنة في قاعدة البيانات على دفعات وتحديثها لحظياً
 * هذا يمنع أي بطء أو تجاوز لحجم البيانات (خصوصاً مع صور Base64 الكبيرة)
 */
export async function loadRealProductImages(
  onBatchLoaded: (imagesMap: Record<string, string>) => void
): Promise<void> {
  try {
    // 1. جلب معرفات المنتجات التي تحتوي على صور فقط
    const { data: idRows, error: idErr } = await supabase
      .from('products')
      .select('id')
      .not('image_url', 'is', null)
      .limit(300);

    if (idErr || !idRows || idRows.length === 0) {
      return;
    }

    const allIds = idRows.map((r: any) => r.id);
    const BATCH_SIZE = 10;

    // 2. طلب الصور بدفعات صغيرة عبر المفتاح الأساسي id لسرعة خيالية ودون انهيار الاتصال
    for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
      const batchIds = allIds.slice(i, i + BATCH_SIZE);
      try {
        const { data: imgData, error: imgErr } = await supabase
          .from('products')
          .select('id, image_url')
          .in('id', batchIds);

        if (!imgErr && imgData && imgData.length > 0) {
          const map: Record<string, string> = {};
          imgData.forEach((row: any) => {
            if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim().length > 10) {
              map[row.id] = row.image_url.trim();
            }
          });
          if (Object.keys(map).length > 0) {
            onBatchLoaded(map);
          }
        }
      } catch (bErr) {
        console.warn('Batch image load issue:', bErr);
      }
    }
  } catch (err) {
    console.error('Failed to load real product images:', err);
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
