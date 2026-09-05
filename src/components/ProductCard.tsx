import React from 'react';
import { Plus } from 'lucide-react';
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
  const isOutOfStock = product.stock <= 0;

  const handleAction = () => {
    if (isOutOfStock) return;
    if (product.hasSizes && product.sizes && product.sizes.length > 0) {
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
        {/* صورة المنتج */}
        <div
          onClick={handleAction}
          className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs">
              لا توجد صورة
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white font-black text-xs">
              نفد من المخزون
            </div>
          )}

          {product.hasSizes && (
            <div className="absolute bottom-2 right-2 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              خيارات ومقاسات
            </div>
          )}
        </div>

        {/* التفاصيل */}
        <div className="p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
            {product.category}
          </span>
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-relaxed">
            {product.name}
          </h3>
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
          <span className="text-base font-black text-slate-900">{product.sell_price}</span>
          <span className="text-[10px] text-slate-500 mr-1">ر.س</span>
        </div>

        <button
          id={`add-btn-${product.id}`}
          disabled={isOutOfStock}
          onClick={handleAction}
          className="p-2 sm:px-3 sm:py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title={isOutOfStock ? 'نفد من المخزون' : 'أضف إلى السلة'}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">أضف</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
