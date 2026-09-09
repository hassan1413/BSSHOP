import React, { useState } from 'react';
import { Plus, Gift, ChevronRight, ChevronLeft, Images, AlertTriangle } from 'lucide-react';
import { Product, ProductSizeVariant } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size?: ProductSizeVariant) => void;
  onSelectForSizes: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectForSizes
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // إعداد وتجميع قائمة الصور المتاحة للمنتج دون تكرار
  const imagesList: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (product.image_url && typeof product.image_url === 'string' && product.image_url.trim().length > 10) {
      list.push(product.image_url.trim());
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (typeof img === 'string' && img.trim().length > 10 && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list;
  }, [product.image_url, product.images]);

  const hasMultipleImages = imagesList.length > 1;

  // التحقق من المخزون والحد الأدنى
  const isOutOfStock = product.stock <= 0;
  const minStockThreshold = (typeof product.min_stock_alert === 'number' && product.min_stock_alert > 0)
    ? product.min_stock_alert
    : 5;
  const isAtMinStock = product.stock > 0 && product.stock <= minStockThreshold;

  // فحص توفر مقاسات مسجلة في قاعدة البيانات بعددها
  const availableSizesCount = (product.hasSizes && Array.isArray(product.sizes)) ? product.sizes.length : 0;
  const hasDbSizes = availableSizesCount > 0;

  // التنقل بين صور المنتج
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  // فتح نافذة المعاينة وتفاصيل الصور والمقاسات (دون إضافة إلى السلة تلقائياً)
  const handleViewDetails = () => {
    onSelectForSizes(product);
  };

  // زر الإضافة الحصري: هو الوحيد المخول بالإدخال في السلة أو اختيار المقاس للشراء
  const handleAddButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    if (hasDbSizes) {
      onSelectForSizes(product);
    } else {
      onAddToCart(product);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 overflow-hidden flex flex-col justify-between group transition-all hover:shadow-lg"
    >
      <div>
        {/* حاوية صورة المنتج - الضغط عليها لمعاينة الصور والتفاصيل وليس للإضافة */}
        <div
          onClick={handleViewDetails}
          className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer select-none"
          title="اضغط لمعاينة تفاصيل وصور المنتج"
        >
          {imagesList.length > 0 ? (
            <img
              src={imagesList[activeImageIndex] || imagesList[0]}
              alt={`${product.name} - صورة ${activeImageIndex + 1}`}
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

          {/* في حال توفر أكثر من صورة للمنتج في قاعدة البيانات: أسهم التنقل ومصغرات الصور */}
          {hasMultipleImages && (
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
                <span className="text-amber-400 font-normal">({activeImageIndex + 1})</span>
              </div>

              {/* شريط مصغرات الصور في أسفل الصورة للتبديل السريع باللمس أو النقر */}
              <div className="absolute bottom-2 inset-x-0 flex justify-center items-center gap-1 z-20 px-2 pointer-events-auto">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
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
              <span>متبقي {product.stock} فقط</span>
            </div>
          )}

          {/* وسم وجود مقاسات مسجلة بعددها من قاعدة البيانات */}
          {hasDbSizes && !isOutOfStock && (
            <div className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 border border-white/10 shadow-xs">
              متوفر بـ {availableSizesCount} مقاسات
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
                {availableSizesCount} مقاسات
              </span>
            )}
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-relaxed">
            {product.name}
          </h3>

          {/* عرض خيارات المقاسات المتوفرة بعددها إذا وُجدت */}
          {hasDbSizes && product.sizes && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {product.sizes.map((s) => (
                <span
                  key={s.name}
                  className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60"
                >
                  {s.name}
                  {typeof s.stock === 'number' && (
                    <span className="text-slate-500 font-normal mr-0.5">({s.stock})</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {product.description && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* السعر وزر الإضافة الحصري */}
      <div className="p-3.5 pt-0 flex items-center justify-between gap-2 border-t border-slate-50 mt-2">
        <div>
          <span className="text-base font-black text-slate-900">{product.sell_price}</span>
          <span className="text-[10px] text-slate-500 mr-1">ر.س</span>
        </div>

        {/* زر الإضافة: هو الوحيد المخول بالإضافة للسلة أو فتح اختيار المقاس */}
        <button
          id={`add-btn-${product.id}`}
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddButtonClick}
          className="p-2 sm:px-3 sm:py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-xs hover:shadow-md"
          title={isOutOfStock ? 'نفد من المخزون' : (hasDbSizes ? `اختر المقاس (${availableSizesCount}) وأضف للسلة` : 'أضف إلى السلة')}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">
            {hasDbSizes ? `اختيار المقاس (${availableSizesCount})` : 'أضف'}
          </span>
          <span className="sm:hidden">
            {hasDbSizes ? `مقاس (${availableSizesCount})` : 'أضف'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
