import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft, AlertTriangle, Images, Package, Sparkles } from 'lucide-react';
import { Product, ProductSizeVariant, CartItem } from '../types';
import { fetchProductDetails } from '../supabaseClient';
import { getVariantImageUrl, getAllProductImages } from '../utils/productUtils';

interface ProductModalProps {
  product: Product | null;
  selectedSize: ProductSizeVariant | null;
  cart?: CartItem[];
  onSelectSize: (size: ProductSizeVariant) => void;
  onClose: () => void;
  onConfirmAddToCart: (product: Product, size?: ProductSizeVariant, customImageUrl?: string, quantity?: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  selectedSize,
  cart,
  onSelectSize,
  onClose,
  onConfirmAddToCart
}) => {
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [hoveredSize, setHoveredSize] = useState<ProductSizeVariant | null>(null);
  const [hoveredSizeIndex, setHoveredSizeIndex] = useState<number | null>(null);
  const [fetchedImages, setFetchedImages] = useState<string[]>([]);
  const [sizesImagesMap, setSizesImagesMap] = useState<Record<string, string>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  // جلب الصور الحقيقية وتفاصيل المقاسات من Supabase فور فتح النافذة
  useEffect(() => {
    let isCurrent = true;
    if (!product) return;

    const variantIds = (product.sizes || []).map((s) => s.id);
    setLoadingDetails(true);

    fetchProductDetails(product.id, variantIds).then((details) => {
      if (!isCurrent) return;
      if (details.images && details.images.length > 0) {
        setFetchedImages(details.images);
      }
      if (details.sizesImages && Object.keys(details.sizesImages).length > 0) {
        setSizesImagesMap(details.sizesImages);
      }
      setLoadingDetails(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [product?.id]);

  // إعداد وتجميع قائمة صور المنتج دون تكرار شاملة صور المقاسات
  const imagesList: string[] = useMemo(() => {
    if (!product) return [];
    const baseList = getAllProductImages(product, sizesImagesMap);
    fetchedImages.forEach((img) => {
      if (img && typeof img === 'string' && img.trim().length > 10 && !baseList.includes(img.trim())) {
        baseList.push(img.trim());
      }
    });
    return baseList;
  }, [product, sizesImagesMap, fetchedImages]);

  // التبديل الفوري لصورة المقاس المحدد عند فتح النافذة أو تغيير المقاس
  useEffect(() => {
    if (!selectedSize || !product) return;
    const sizeIdx = product.sizes ? product.sizes.findIndex((s) => s.id === selectedSize.id || s.name === selectedSize.name) : -1;
    const targetImg = getVariantImageUrl(selectedSize, sizeIdx, imagesList, product.image_url, sizesImagesMap);
    if (targetImg) {
      const idx = imagesList.indexOf(targetImg);
      if (idx !== -1) {
        setModalImageIndex(idx);
      }
    }
  }, [selectedSize, imagesList, sizesImagesMap, product]);

  if (!product) return null;

  const hasMultipleImages = imagesList.length > 1;

  // الحجم الحالي الفعّال (إما معاينة بالوقوف أو المختار بالنقر)
  const activeSize = hoveredSize || selectedSize;
  const activeSizeIndex = hoveredSizeIndex ?? (selectedSize && product.sizes ? product.sizes.findIndex((s) => s.id === selectedSize.id || s.name === selectedSize.name) : 0);

  // حساب صورة العرض الحالية بالمعرض
  const activeGalleryImage: string | undefined = useMemo(() => {
    if (hoveredSize) {
      const hImg = getVariantImageUrl(hoveredSize, hoveredSizeIndex ?? 0, imagesList, product.image_url, sizesImagesMap);
      if (hImg) return hImg;
    }
    if (imagesList[modalImageIndex]) {
      return imagesList[modalImageIndex];
    }
    if (selectedSize) {
      const sImg = getVariantImageUrl(selectedSize, activeSizeIndex, imagesList, product.image_url, sizesImagesMap);
      if (sImg) return sImg;
    }
    return imagesList[0] || product.image_url;
  }, [hoveredSize, hoveredSizeIndex, imagesList, modalImageIndex, selectedSize, activeSizeIndex, product.image_url, sizesImagesMap]);

  // التحقق من المخزون والحد الأدنى
  const activeStock = typeof activeSize?.stock === 'number' ? activeSize.stock : product.stock;
  const minStockThreshold = (typeof product.min_stock_alert === 'number' && product.min_stock_alert > 0)
    ? product.min_stock_alert
    : 5;
  const isAtMinStock = activeStock > 0 && activeStock <= minStockThreshold;
  const isOutOfStock = activeStock <= 0;

  // فحص الكمية الموجودة في السلة لهذا المنتج أو المقاس
  const targetItemKey = activeSize ? `${product.id}-${activeSize.name}` : product.id;
  const inCartItem = cart?.find((item) => item.id === targetItemKey);
  const inCartQty = inCartItem?.quantity || 0;
  const remainingStock = Math.max(0, activeStock - inCartQty);
  const isMaxInCart = activeStock > 0 && inCartQty >= activeStock;

  // كمية الإضافة المباشرة في النافذة
  const [modalQty, setModalQty] = useState(1);

  useEffect(() => {
    setModalQty(1);
  }, [activeSize?.id, activeSize?.name]);

  const currentPrice = product.sell_price + (activeSize?.priceDelta || 0);

  const handlePrev = () => {
    setHoveredSize(null);
    setModalImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setHoveredSize(null);
    setModalImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  // اختيار صورة من المعرض وتحديث المقاس المقترن بها إن وجد
  const handleSelectImage = (index: number) => {
    setHoveredSize(null);
    setModalImageIndex(index);
    const chosenUrl = imagesList[index];
    if (chosenUrl && product.sizes && product.sizes.length > 0) {
      const matchingVariant = product.sizes.find(
        (s) => s.image_url === chosenUrl || sizesImagesMap[s.id] === chosenUrl
      );
      if (matchingVariant) {
        onSelectSize(matchingVariant);
      }
    }
  };

  // اختيار المقاس وتحديث المعرض فوراً
  const handleSelectSizeVariant = (size: ProductSizeVariant, idx: number) => {
    onSelectSize(size);
    const targetImg = getVariantImageUrl(size, idx, imagesList, product.image_url, sizesImagesMap);
    if (targetImg) {
      const foundIdx = imagesList.indexOf(targetImg);
      if (foundIdx !== -1) {
        setModalImageIndex(foundIdx);
      }
    }
  };

  // تأكيد الإضافة للسلة مع اعتماد صورة المقاس الفعلي والكمية بدقة
  const handleConfirmAdd = () => {
    if (!product || isOutOfStock || isMaxInCart || remainingStock <= 0) return;
    const finalSize = selectedSize || (product.hasSizes && product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    const finalIdx = finalSize && product.sizes ? product.sizes.findIndex((s) => s.id === finalSize.id || s.name === finalSize.name) : 0;
    const finalImage = getVariantImageUrl(finalSize, finalIdx, imagesList, product.image_url, sizesImagesMap) || activeGalleryImage;
    const qtyToAdd = Math.min(modalQty, remainingStock);
    if (qtyToAdd > 0) {
      onConfirmAddToCart(product, finalSize, finalImage, qtyToAdd);
    }
  };

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-lg w-full space-y-4 shadow-2xl relative border border-slate-100 my-auto max-h-[92vh] overflow-y-auto">
        {/* رأس النافذة */}
        <div className="flex justify-between items-start gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                {product.category}
              </span>
              {product.sku && (
                <span className="text-[10px] text-slate-400 font-mono">
                  كود: {product.sku}
                </span>
              )}
            </div>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 mt-1.5 leading-snug">
              {product.name}
            </h3>
          </div>
          <button
            id="close-modal-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* عرض الصور: صورة واحدة أو معرض متعدد مع التنقل المصغر وتبديل فوري للمقاس */}
        {activeGalleryImage ? (
          <div className="space-y-2.5">
            <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner group">
              <img
                src={activeGalleryImage}
                alt={`${product.name} ${activeSize ? `- ${activeSize.name}` : ''}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />

              {/* شارة توضيحية فورية تظهر اسم المقاس وصورته بالمعرض */}
              {activeSize && (
                <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-md border border-amber-400/40 animate-in fade-in zoom-in-95 duration-150">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>صورة: {activeSize.name}</span>
                </div>
              )}

              {/* شارة عدد الصور الإجمالي المتوفرة في قاعدة البيانات */}
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <Images className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {hasMultipleImages ? `${imagesList.length} صور متوفرة` : 'صورة المنتج'}
                </span>
              </div>

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="الصورة السابقة"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer z-10 shadow-md active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="الصورة التالية"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer z-10 shadow-md active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 z-10">
                    <span>{modalImageIndex + 1} من {imagesList.length}</span>
                  </div>
                </>
              )}
            </div>

            {/* شريط الصور المصغرة المتوفرة لهذا المنتج في قاعدة البيانات */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectImage(idx)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer relative ${
                      idx === modalImageIndex
                        ? 'border-amber-500 scale-105 shadow-sm ring-2 ring-amber-400/30'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-44 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700">{product.name}</span>
            <span className="text-[11px] text-slate-400">
              {loadingDetails ? 'جارٍ فحص الصور المتوفرة...' : 'لا توجد صور مسجلة لهذا المنتج في قاعدة البيانات'}
            </span>
          </div>
        )}

        {/* تنبيه عدد الكمية عند انخفاض المخزون */}
        {isAtMinStock && !isOutOfStock && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 text-xs font-bold text-amber-950 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span>تنبيه المخزون:</span>
              <span className="font-black text-amber-900">
                متبقي {activeStock} {product.unit || 'حبة'} فقط
              </span>
            </div>
          </div>
        )}

        {isOutOfStock && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>عذراً، هذا الخيار نفد حالياً من المخزون</span>
          </div>
        )}

        {/* عرض المقاسات المتوفرة من قاعدة البيانات بعددها الحقيقي ومصغراتها وصورها */}
        {product.hasSizes && product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>المقاسات والخيارات المتوفرة</span>
                <span className="text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full font-black text-[11px] border border-amber-200">
                  {product.sizes.length} خيارات متوفرة
                </span>
              </label>
              {selectedSize && (
                <span className="text-[11px] font-bold text-amber-700">
                  المحدد: {selectedSize.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
              {product.sizes.map((size, idx) => {
                const isSelected = selectedSize?.id === size.id || selectedSize?.name === size.name;
                const isHovered = hoveredSize?.id === size.id || hoveredSize?.name === size.name;
                const sizePrice = product.sell_price + (size.priceDelta || 0);
                const sizeStock = typeof size.stock === 'number' ? size.stock : product.stock;
                const sizeImg = getVariantImageUrl(size, idx, imagesList, product.image_url, sizesImagesMap);

                return (
                  <button
                    key={size.id || size.name || idx}
                    type="button"
                    onMouseEnter={() => {
                      setHoveredSize(size);
                      setHoveredSizeIndex(idx);
                    }}
                    onMouseLeave={() => {
                      setHoveredSize(null);
                      setHoveredSizeIndex(null);
                    }}
                    onClick={() => handleSelectSizeVariant(size, idx)}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-bold transition-all text-right flex items-center justify-between gap-2 cursor-pointer select-none ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-xs ring-2 ring-amber-400/40'
                        : isHovered
                        ? 'border-amber-400 bg-slate-50 text-slate-900 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* صورة مصغرة للمقاس المحدد */}
                      {sizeImg ? (
                        <img
                          src={sizeImg}
                          alt=""
                          className={`w-10 h-10 rounded-xl object-cover shrink-0 border ${
                            isSelected ? 'border-amber-500 ring-1 ring-amber-400/40' : 'border-slate-200'
                          }`}
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold flex items-center gap-1.5 truncate">
                          <span className="truncate">{size.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0">
                            (متبقي {sizeStock})
                          </span>
                        </div>
                        <div className="text-amber-700 font-black mt-0.5">
                          {sizePrice} ر.س
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* اختيار الكمية والتحقق من المخزون */}
        {activeStock > 0 && !isMaxInCart && remainingStock > 0 && (
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-800 block">الكمية المطلوبة:</span>
              <span className="text-[10px] text-slate-500">
                المتاح للإضافة: <strong className="text-amber-700">{remainingStock}</strong> من أصل {activeStock}
                {inCartQty > 0 && ` (لديك ${inCartQty} بالسلة)`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setModalQty((prev) => Math.max(1, prev - 1))}
                disabled={modalQty <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 cursor-pointer font-black text-sm"
              >
                -
              </button>
              <span className="font-black text-xs px-2 min-w-5 text-center text-slate-900">
                {modalQty}
              </span>
              <button
                type="button"
                onClick={() => setModalQty((prev) => Math.min(remainingStock, prev + 1))}
                disabled={modalQty >= remainingStock}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 cursor-pointer font-black text-sm"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* تنبيه إذا وصل العميل للحد الأقصى في السلة */}
        {isMaxInCart && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 font-bold flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>لديك بالفعل الحد الأقصى المتوفر بالمخزون ({activeStock} قطع) في سلتك.</span>
          </div>
        )}

        {/* السعر وتأكيد الإضافة */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">السعر المطلوب:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">
                {(currentPrice * (isMaxInCart ? 1 : modalQty)).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">ر.س</span>
            </div>
          </div>

          <button
            id="confirm-add-to-cart-btn"
            type="button"
            disabled={isOutOfStock || isMaxInCart || remainingStock <= 0}
            onClick={handleConfirmAdd}
            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer disabled:cursor-not-allowed text-center"
          >
            {isOutOfStock
              ? 'نفد من المخزون'
              : isMaxInCart
              ? `وصلت للحد الأقصى (${activeStock})`
              : modalQty > 1
              ? `إضافة ${modalQty} للسلة`
              : selectedSize
              ? `إضافة للسلة (${selectedSize.name})`
              : 'تأكيد الإضافة للسلة'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
