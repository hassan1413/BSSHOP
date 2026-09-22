import React, { useState, useMemo } from 'react';
import { Plus, Gift, ChevronRight, ChevronLeft, Images, AlertTriangle, Check } from 'lucide-react';
import { Product, ProductSizeVariant, CartItem } from '../types';
import { getVariantImageUrl, getAllProductImages } from '../utils/productUtils';

interface ProductCardProps {
  product: Product;
  cart?: CartItem[];
  onAddToCart: (product: Product, size?: ProductSizeVariant, customImageUrl?: string) => void;
  onSelectForSizes: (product: Product, initialSize?: ProductSizeVariant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cart,
  onAddToCart,
  onSelectForSizes
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSizeVariant | null>(null);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(null);
  const [hoveredSize, setHoveredSize] = useState<ProductSizeVariant | null>(null);
  const [hoveredSizeIndex, setHoveredSizeIndex] = useState<number | null>(null);

  // إعداد وتجميع قائمة الصور المتاحة للمنتج ومقاساته دون تكرار
  const imagesList: string[] = useMemo(() => {
    return getAllProductImages(product);
  }, [product]);

  const hasMultipleImages = imagesList.length > 1;

  // التحقق من المخزون والحد الأدنى
  const activeSize = hoveredSize || selectedSize;
  const currentStock = typeof activeSize?.stock === 'number' ? activeSize.stock : product.stock;
  const isOutOfStock = currentStock <= 0;
  const minStockThreshold = (typeof product.min_stock_alert === 'number' && product.min_stock_alert > 0)
    ? product.min_stock_alert
    : 5;
  const isAtMinStock = currentStock > 0 && currentStock <= minStockThreshold;

  // فحص وتصفية الخيارات المتوفرة فقط في المخزون (استبعاد أي مقاس/خيار نفد)
  const availableSizes = useMemo(() => {
    if (!product.hasSizes || !Array.isArray(product.sizes)) return [];
    return product.sizes.filter((s) => {
      const sStock = typeof s.stock === 'number' ? s.stock : product.stock;
      return typeof sStock === 'number' && sStock > 0;
    });
  }, [product.hasSizes, product.sizes, product.stock]);

  const availableSizesCount = availableSizes.length;
  const hasDbSizes = availableSizesCount > 0;

  // السعر الحالي استناداً للمقاس المختار أو المعاين
  const currentPrice = product.sell_price + (activeSize?.priceDelta || 0);

  // حساب صورة العرض الحالية: مقاس بالوقوف بالماوس > مقاس مختار بالضغط > صورة المعرض العادية
  const currentDisplayedImage: string | undefined = useMemo(() => {
    if (hoveredSize && hoveredSizeIndex !== null) {
      const img = getVariantImageUrl(hoveredSize, hoveredSizeIndex, imagesList, product.image_url);
      if (img) return img;
    }
    if (selectedSize && selectedSizeIndex !== null) {
      const img = getVariantImageUrl(selectedSize, selectedSizeIndex, imagesList, product.image_url);
      if (img) return img;
    }
    return imagesList[activeImageIndex] || imagesList[0] || product.image_url;
  }, [hoveredSize, hoveredSizeIndex, selectedSize, selectedSizeIndex, imagesList, activeImageIndex, product.image_url]);

  // التنقل بين صور المنتج
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredSize(null);
    setSelectedSize(null);
    setActiveImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredSize(null);
    setSelectedSize(null);
    setActiveImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  // فتح نافذة المعاينة وتفاصيل الصور والمقاسات
  const handleViewDetails = () => {
    onSelectForSizes(product, selectedSize || undefined);
  };

  // التعامل مع النقر على مقاس محدد
  const handleSizeClick = (s: ProductSizeVariant, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedSize?.id === s.id || (selectedSize?.name === s.name && !selectedSize?.id)) {
      // إلغاء الاختيار والرجوع للصورة العامة
      setSelectedSize(null);
      setSelectedSizeIndex(null);
    } else {
      setSelectedSize(s);
      setSelectedSizeIndex(idx);
    }
  };

  // التحقق من الكمية الموجودة في السلة حالياً لمنع تجاوز المخزون
  const targetItemKey = activeSize ? `${product.id}-${activeSize.name}` : product.id;
  const inCartItem = cart?.find((item) => item.id === targetItemKey);
  const inCartQty = inCartItem?.quantity || 0;
  const isMaxInCart = currentStock > 0 && inCartQty >= currentStock;

  // زر الإضافة الحصري: هو المخول بالإدخال في السلة أو فتح المقاس
  const handleAddButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInCart) return;

    if (selectedSize) {
      // في حال تم اختيار مقاس محدد من البطاقة مسبقاً، يتم إضافته فوراً بصورته المخصصة
      onAddToCart(product, selectedSize, currentDisplayedImage);
    } else if (hasDbSizes) {
      onSelectForSizes(product);
    } else {
      onAddToCart(product, undefined, currentDisplayedImage);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 overflow-hidden flex flex-col justify-between group transition-all hover:shadow-lg relative"
    >
      <div>
        {/* حاوية صورة المنتج - الضغط عليها لمعاينة الصور والتفاصيل */}
        <div
          onClick={handleViewDetails}
          className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer select-none"
          title="اضغط لمعاينة تفاصيل وصور المنتج"
        >
          {currentDisplayedImage ? (
            <img
              src={currentDisplayedImage}
              alt={`${product.name} ${activeSize ? `- مقاس ${activeSize.name}` : ''}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-500/5 to-slate-100/90 p-4 text-center select-none group-hover:from-amber-500/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-amber-200/40 flex items-center justify-center text-amber-600 mb-1.5 group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 line-clamp-1">
                {product.category}
              </span>
              <span className="text-[9px] text-amber-700 font-medium">بقشة سعادة</span>
            </div>
          )}

          {/* شارة توضيحية أعلى الصورة فور الوقوف أو الضغط على مقاس أو خيار معين */}
          {activeSize && (
            <div className="absolute top-2 right-2 z-20 bg-slate-950/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-amber-400/40 animate-in fade-in zoom-in-95 duration-150">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{activeSize.name}</span>
              {hoveredSize && !selectedSize && (
                <span className="text-amber-300 text-[9px]">(معاينة)</span>
              )}
            </div>
          )}

          {/* في حال توفر أكثر من صورة للمنتج: أسهم التنقل ومصغرات الصور */}
          {hasMultipleImages && !activeSize && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="الصورة السابقة"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="الصورة التالية"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* عداد وعدد الصور المتاحة */}
              <div className="absolute top-2 left-2 z-20 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10">
                <Images className="w-3 h-3 text-amber-400" />
                <span>{imagesList.length} صور</span>
              </div>

              {/* شريط مصغرات الصور في أسفل الصورة للتبديل السريع */}
              <div className="absolute bottom-2 inset-x-0 flex justify-center items-center gap-1 z-20 px-2 pointer-events-auto">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredSize(null);
                      setSelectedSize(null);
                      setActiveImageIndex(idx);
                    }}
                    aria-label={`عرض صورة ${idx + 1}`}
                    className={`rounded overflow-hidden transition-all duration-200 cursor-pointer border ${
                      idx === activeImageIndex
                        ? 'w-6 h-6 border-amber-400 ring-2 ring-amber-400/40 shadow-sm scale-105'
                        : 'w-4 h-4 border-white/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* تنبيه نفاد المخزون */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center text-white font-black text-xs z-20">
              نفد من المخزون
            </div>
          )}

          {/* تنبيه عدد الكمية المتبقية عند انخفاض المخزون */}
          {!isOutOfStock && isAtMinStock && (
            <div className="absolute top-2 right-2 z-10 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-amber-400/80">
              <AlertTriangle className="w-3 h-3 text-slate-950 shrink-0" />
              <span>متبقي {currentStock} فقط</span>
            </div>
          )}

          {/* وسم وجود خيارات/مقاسات مسجلة بعددها من قاعدة البيانات إذا لم يتم معاينة مقاس */}
          {hasDbSizes && !isOutOfStock && !activeSize && (
            <div className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 border border-white/10 shadow-xs">
              {availableSizesCount} خيارات
            </div>
          )}
        </div>

        {/* تفاصيل المنتج */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
              {product.category}
            </span>

            {/* تفاصيل عدد المقاسات من قاعدة البيانات */}
            {hasDbSizes && (
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {availableSizesCount} خيارات
              </span>
            )}
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-relaxed">
            {product.name}
          </h3>

          {/* خيارات المقاسات التفاعلية: عند الوقوف أو الضغط تتغير الصورة فوراً مع صورة مصغرة وشارة توضيحية */}
          {hasDbSizes && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-500 font-medium block">
                الخيارات المتوفرة (قف أو اضغط لتبديل الصورة):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((s, idx) => {
                  const isSelected = selectedSize?.id === s.id || (selectedSize?.name === s.name && !selectedSize?.id);
                  const isHovered = hoveredSize?.id === s.id || (hoveredSize?.name === s.name && !hoveredSize?.id);
                  const sImg = getVariantImageUrl(s, idx, imagesList, product.image_url);
                  const sPrice = product.sell_price + (s.priceDelta || 0);
                  const sStock = typeof s.stock === 'number' ? s.stock : product.stock;

                  return (
                    <button
                      key={s.id || s.name || idx}
                      type="button"
                      onMouseEnter={() => {
                        setHoveredSize(s);
                        setHoveredSizeIndex(idx);
                      }}
                      onMouseLeave={() => {
                        setHoveredSize(null);
                        setHoveredSizeIndex(null);
                      }}
                      onClick={(e) => handleSizeClick(s, idx, e)}
                      title={`${s.name} | السعر: ${sPrice} ر.س | المتبقي: ${sStock} حبة`}
                      className={`relative group/size text-[11px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400/40 scale-102'
                          : isHovered
                          ? 'border-amber-400 bg-amber-50 text-amber-950 scale-102 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-slate-100'
                      }`}
                    >
                      {/* صورة مصغرة للمقاس المحدد */}
                      {sImg ? (
                        <img
                          src={sImg}
                          alt=""
                          className={`w-4 h-4 rounded-md object-cover shrink-0 border ${
                            isSelected ? 'border-amber-600' : 'border-slate-300/80'
                          }`}
                        />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-slate-950' : 'bg-slate-400'}`} />
                      )}

                      <span>{s.name}</span>

                      {isSelected && (
                        <Check className="w-3 h-3 text-slate-950 shrink-0 stroke-[3]" />
                      )}

                      {/* شارة توضيحية عائمة (Tooltip) تظهر عند الوقوف على المقاس بالماوس */}
                      <div className="absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 pointer-events-none opacity-0 group-hover/size:opacity-100 transition-opacity duration-150 z-30 bg-slate-950 text-white text-[10px] rounded-lg p-2 shadow-xl border border-slate-800 whitespace-nowrap min-w-28 text-center space-y-0.5">
                        <div className="font-bold text-amber-400">{s.name}</div>
                        <div className="text-[9px] text-slate-300">السعر: {sPrice} ر.س</div>
                        <div className="text-[9px] text-slate-400">المتوفر: {sStock} حبة</div>
                        <div className="text-[8px] text-emerald-400 pt-0.5">انقر للتثبيت والاختيار</div>
                        <div className="absolute top-full right-1/2 translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {product.description && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* السعر وزر الإضافة */}
      <div className="p-3.5 pt-0 flex items-center justify-between gap-2 border-t border-slate-50 mt-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-slate-900">{currentPrice}</span>
            <span className="text-[10px] text-slate-500">ر.س</span>
          </div>
          {inCartQty > 0 ? (
            <span className="text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded font-bold block mt-0.5">
              في السلة: {inCartQty} من {currentStock}
            </span>
          ) : activeSize?.priceDelta ? (
            <span className="text-[9px] text-amber-700 block font-medium">
              ({activeSize.name})
            </span>
          ) : null}
        </div>

        {/* زر الإضافة: يضيف المقاس المختار فوراً أو يفتح نافذة الاختيار */}
        <button
          id={`add-btn-${product.id}`}
          type="button"
          disabled={isOutOfStock || isMaxInCart}
          onClick={handleAddButtonClick}
          className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-xs hover:shadow-md ${
            isOutOfStock
              ? 'bg-slate-200 text-slate-400'
              : isMaxInCart
              ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-0'
              : selectedSize
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-400/50'
              : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
          }`}
          title={
            isOutOfStock
              ? 'نفد من المخزون'
              : isMaxInCart
              ? `وصلت للحد الأقصى المتوفر بالسلة (${currentStock} قطع)`
              : selectedSize
              ? `أضف (${selectedSize.name}) بصورته وسعره المحدد إلى السلة`
              : hasDbSizes
              ? `اختر من (${availableSizesCount}) وأضف للسلة`
              : 'أضف إلى السلة'
          }
        >
          {isMaxInCart ? (
            <Check className="w-4 h-4 text-amber-800" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isOutOfStock
              ? 'نفد'
              : isMaxInCart
              ? `بالسلة (${currentStock})`
              : selectedSize
              ? `أضف (${selectedSize.name})`
              : hasDbSizes
              ? `اختيار (${availableSizesCount})`
              : 'أضف'}
          </span>
          <span className="sm:hidden">
            {isOutOfStock
              ? 'نفد'
              : isMaxInCart
              ? `بالسلة (${currentStock})`
              : selectedSize
              ? `أضف (${selectedSize.name})`
              : hasDbSizes
              ? `(${availableSizesCount}) خيارات`
              : 'أضف'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
