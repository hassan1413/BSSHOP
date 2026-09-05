import React from 'react';
import { X, Check } from 'lucide-react';
import { Product, ProductSizeVariant } from '../types';

interface ProductModalProps {
  product: Product | null;
  selectedSize: ProductSizeVariant | null;
  onSelectSize: (size: ProductSizeVariant) => void;
  onClose: () => void;
  onConfirmAddToCart: (product: Product, size?: ProductSizeVariant) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  selectedSize,
  onSelectSize,
  onClose,
  onConfirmAddToCart
}) => {
  if (!product) return null;

  const currentPrice = product.sell_price + (selectedSize?.priceDelta || 0);

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl p-6 max-w-sm sm:max-w-md w-full space-y-4 shadow-2xl relative border border-slate-100">
        <div className="flex justify-between items-start gap-3">
          <div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <h3 className="font-black text-lg text-slate-900 mt-1 leading-snug">
              {product.name}
            </h3>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {product.image_url && (
          <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {product.description && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {product.description}
          </p>
        )}

        {product.hasSizes && product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              اختر المقاس أو الحجم المطلوب:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.sizes.map((size) => {
                const isSelected = selectedSize?.name === size.name;
                const sizePrice = product.sell_price + (size.priceDelta || 0);

                return (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => onSelectSize(size)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-right flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{size.name}</div>
                      <div className="text-slate-500 font-normal mt-0.5">
                        {sizePrice} ر.س
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 block">المبلغ:</span>
            <span className="text-xl font-black text-slate-900">{currentPrice}</span>
            <span className="text-xs text-slate-500 mr-1">ر.س</span>
          </div>

          <button
            id="confirm-add-to-cart-btn"
            onClick={() => {
              onConfirmAddToCart(product, selectedSize || undefined);
            }}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
          >
            تأكيد الإضافة للسلة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
