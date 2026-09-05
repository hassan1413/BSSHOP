import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-black text-2xl select-none">
            ب
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">بقشة سعادة</h1>
            <p className="text-xs text-slate-500">متجر الهدايا والكماليات</p>
          </div>
        </div>

        {/* زر السلة */}
        <button
          id="cart-toggle-btn"
          onClick={onOpenCart}
          className="relative flex items-center gap-2.5 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span className="hidden sm:inline">سلة الطلبات</span>
          {cartCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-black">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
