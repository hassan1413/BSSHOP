import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-xs border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-3">
        {/* هوية المتجر */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-black text-2xl select-none shrink-0">
            ب
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">بقشة سعادة</h1>
            <p className="text-[11px] sm:text-xs text-slate-500">كل ما تحتاجينه لأناقتكِ… في مكان واحد ✨</p>
          </div>
        </div>

        {/* سلة الطلبات */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="cart-toggle-btn"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 cursor-pointer text-xs sm:text-sm"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="hidden sm:inline">سلة الطلبات</span>
            {cartCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
