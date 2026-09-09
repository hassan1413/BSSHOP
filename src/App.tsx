import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Product, CartItem, PromoCode, ProductSizeVariant } from './types';
import { 
  getStoreProducts, 
  loadRealProductImages,
  getPromoCodes, 
  submitCustomerOrder, 
  subscribeToProductUpdates 
} from './supabaseClient';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import OrderSuccessModal from './components/OrderSuccessModal';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // الفلاتر والبحث
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  
  // السلة
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('boksha_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // حفظ السلة في التخزين المحلي
  useEffect(() => {
    try {
      localStorage.setItem('boksha_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  // النافذة المنبثقة للمنتج (المقاسات والتفاصيل)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempSelectedSize, setTempSelectedSize] = useState<ProductSizeVariant | null>(null);

  // الكوبون
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCode | null>(null);
  const [couponError, setCouponError] = useState('');

  // إتمام الطلب
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  // تحميل البيانات الحقيقية من Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, codes] = await Promise.all([
        getStoreProducts(),
        getPromoCodes()
      ]);

      const validProds = prods || [];
      setProducts(validProds);
      setPromoCodes(codes || []);

      // جلب الصور الحقيقية المحفوظة في قاعدة البيانات تدريجياً لجميع المنتجات
      loadRealProductImages((imageBatch) => {
        setProducts((prev) =>
          prev.map((p) => {
            const realData = imageBatch[p.id];
            return realData ? { ...p, image_url: realData.image_url, images: realData.images } : p;
          })
        );
        setCart((prev) =>
          prev.map((item) => {
            const realData = imageBatch[item.productId];
            return realData && !item.image_url ? { ...item, image_url: realData.image_url } : item;
          })
        );
      });
    } catch (err) {
      console.warn('Error loading store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadData();

    // مزامنة لحظية مع Supabase Realtime
    const unsubscribe = subscribeToProductUpdates(async () => {
      if (!isMounted) return;
      try {
        const refreshed = await getStoreProducts();
        if (isMounted && refreshed && refreshed.length > 0) {
          setProducts(refreshed);
          loadRealProductImages((imageBatch) => {
            if (!isMounted) return;
            setProducts((prev) =>
              prev.map((p) => {
                const realData = imageBatch[p.id];
                return realData ? { ...p, image_url: realData.image_url, images: realData.images } : p;
              })
            );
          });
        }
      } catch (err) {
        console.warn('Realtime refresh caught:', err);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // التصنيفات المتاحة
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['الكل', ...Array.from(set)];
  }, [products]);

  // المنتجات المفلترة
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'الكل' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  // إضافة منتج إلى السلة
  const addToCart = (product: Product, size?: ProductSizeVariant) => {
    const itemKey = size ? `${product.id}-${size.name}` : product.id;
    const finalPrice = product.sell_price + (size?.priceDelta || 0);

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.id === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: size ? size.id : product.id,
          name: size ? `${product.name} (${size.name})` : product.name,
          category: product.category,
          price: finalPrice,
          originalPrice: finalPrice,
          quantity: 1,
          image_url: size?.image_url || product.image_url,
          selectedSize: size,
          availableStock: size?.stock ?? product.stock
        }
      ];
    });

    setSelectedProduct(null);
    setTempSelectedSize(null);
  };

  const handleOpenProductModal = (product: Product) => {
    setSelectedProduct(product);
    if (product.sizes && product.sizes.length > 0) {
      setTempSelectedSize(product.sizes[0]);
    } else {
      setTempSelectedSize(null);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // العمليات الحسابية
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage' || (appliedCoupon.type as string) === 'percent') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    return Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const finalTotal = Math.max(0, subtotal - discountAmount);
  const totalCartCount = useMemo(() => {
    return cart.reduce((s, i) => s + i.quantity, 0);
  }, [cart]);

  // تطبيق الكوبون
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponInput.trim()) {
      setCouponError('يرجى كتابة كود الخصم');
      return;
    }
    const codeMatch = promoCodes.find(
      (c) => c.code.trim().toUpperCase() === couponInput.trim().toUpperCase()
    );
    if (!codeMatch) {
      setCouponError('كود الخصم غير صالح أو منتهي الصلاحية');
      return;
    }
    setAppliedCoupon(codeMatch);
    setCouponInput('');
  };

  // إرسال الطلب
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('يرجى ملء الاسم ورقم الجوال');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCustomerOrder({
        customerName,
        customerPhone,
        deliveryAddress,
        notes,
        items: cart,
        totalAmount: finalTotal,
        discount: discountAmount
      });

      setCompletedOrderNumber(res.orderNumber);
      setCart([]);
      setIsCartOpen(false);
      
      // تفاعل احتفالي لطيف
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
    } catch (err: any) {
      alert(`حدث خطأ أثناء إرسال الطلب: ${err?.message || 'يرجى المحاولة مرة أخرى'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Tajawal',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      {/* 1. الترويسة الرئيسية */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 2. بانر الترحيب والبحث */}
      <HeroBanner
        productsCount={products.length}
        search={search}
        onSearchChange={setSearch}
      />

      {/* 3. شريط التصنيفات */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. شبكة المنتجات */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                <div className="w-full aspect-square bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 max-w-lg mx-auto">
            <p className="text-slate-700 font-bold text-base">تعذر تحميل المنتجات أو لم تكتمل استجابة الشبكة</p>
            <p className="text-slate-400 text-xs mt-1">اضغط على الزر أدناه لإعادة تحديث وتحميل قائمة المنتجات من الخادم</p>
            <button
              onClick={() => loadData()}
              className="mt-4 px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              إعادة محاولة التحميل
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <p className="text-slate-600 font-bold text-base">لا توجد منتجات تطابق بحثك حالياً</p>
            <p className="text-slate-400 text-xs mt-1">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('الكل');
              }}
              className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
            >
              عرض جميع المنتجات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onSelectForSizes={handleOpenProductModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. نافذة اختيار المقاس والتفاصيل */}
      {selectedProduct && (
        <ProductModal
          product={products.find((p) => p.id === selectedProduct.id) || selectedProduct}
          selectedSize={tempSelectedSize}
          onSelectSize={setTempSelectedSize}
          onClose={() => {
            setSelectedProduct(null);
            setTempSelectedSize(null);
          }}
          onConfirmAddToCart={addToCart}
        />
      )}

      {/* 6. درج السلة الجانبي */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        couponInput={couponInput}
        onCouponInputChange={setCouponInput}
        onApplyCoupon={handleApplyCoupon}
        couponError={couponError}
        appliedCoupon={appliedCoupon}
        subtotal={subtotal}
        discountAmount={discountAmount}
        finalTotal={finalTotal}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        isSubmitting={isSubmitting}
        onCheckout={handleCheckout}
      />

      {/* 7. نافذة نجاح الطلب */}
      <OrderSuccessModal
        orderNumber={completedOrderNumber}
        onClose={() => setCompletedOrderNumber(null)}
      />

      {/* 8. تذييل الصفحة */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-700 text-sm">متجر بقشة سعادة الإلكتروني</p>
          <p className="text-slate-400">وجهتك الأولى لأجمل الهدايا والكماليات المغلفة بكل حب وإتقان</p>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
