import React from 'react';
import { Sparkles, Search } from 'lucide-react';

interface HeroBannerProps {
  productsCount: number;
  search: string;
  onSearchChange: (val: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  productsCount,
  search,
  onSearchChange
}) => {
  return (
    <div className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent py-10 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> تشكيلة واسعة بأسعار منافسة
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          اختر هداياك المفضلة وسنجهزها لك فوراً
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          تصفح أكثر من {productsCount} صنف، أضف إلى السلة، وسيتلقى الموظف طلبك للتجهيز مباشرة.
        </p>

        {/* شريط البحث */}
        <div className="relative max-w-xl mx-auto pt-2">
          <input
            id="store-search-input"
            type="text"
            placeholder="ابحث عن منتج، هدية، أو تصنيف..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pr-12 pl-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 mt-1 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
