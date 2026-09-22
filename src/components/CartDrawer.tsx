import React from 'react';
import { ShoppingBag, X, Plus, Minus, ArrowRight, Tag, AlertCircle, CheckCircle2, Gift } from 'lucide-react';
import { CartItem, PromoCode } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  couponInput: string;
  onCouponInputChange: (val: string) => void;
  onApplyCoupon: () => void;
  couponError: string;
  appliedCoupon: PromoCode | null;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (val: string) => void;
  isSubmitting: boolean;
  onCheckout: (e: React.FormEvent) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  couponInput,
  onCouponInputChange,
  onApplyCoupon,
  couponError,
  appliedCoupon,
  subtotal,
  discountAmount,
  finalTotal,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  deliveryAddress,
  setDeliveryAddress,
  isSubmitting,
  onCheckout
}) => {
  if (!isOpen) return null;

  return (
    <div id="cart-drawer-container" className="fixed inset-0 z-50 overflow-hidden">
      {/* خلفية معتمة */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 left-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 border-r border-slate-100">
        {/* شريط رأس السلة */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-base text-slate-900">سلة الطلبات</h2>
            {cart.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} أصناف
              </span>
            )}
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتويات السلة */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <p className="font-bold text-sm text-slate-600">سلتك فارغة حالياً</p>
              <p className="text-xs text-slate-400">أضف بعض الهدايا والمنتجات للبدء بالطلب</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                id={`cart-item-${item.id}`}
                className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 items-center"
              >
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-slate-200">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-600">
                      <Gift className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate leading-snug">
                    {item.name}
                  </h4>
                  {item.selectedSize && (
                    <span className="text-[10px] text-amber-900 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded-md font-bold mt-0.5 inline-block">
                      {item.selectedSize.name}
                    </span>
                  )}
                  <div className="text-xs font-black text-slate-900 mt-1">
                    {item.price * item.quantity} <span className="text-[10px] font-normal text-slate-500">ر.س</span>
                  </div>
                  {item.availableStock <= 0 ? (
                    <div className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-1">
                      <span>نفد من المخزون</span>
                    </div>
                  ) : item.quantity >= item.availableStock && (
                    <div className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-1">
                      <span>الحد الأقصى للمخزون ({item.availableStock})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 self-center">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    title="تقليل الكمية"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-black text-xs px-1 min-w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    disabled={item.quantity >= item.availableStock}
                    className={`p-1 rounded transition-colors ${
                      item.quantity >= item.availableStock
                        ? 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400'
                        : 'hover:bg-slate-100 text-slate-600 cursor-pointer'
                    }`}
                    title={
                      item.quantity >= item.availableStock
                        ? `الكمية المتوفرة بالمخزون هي ${item.availableStock} فقط`
                        : "زيادة الكمية"
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* قسم الكوبون */}
          {cart.length > 0 && (
            <div className="pt-2 border-t border-slate-100 mt-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="coupon-input"
                    type="text"
                    placeholder="كود الخصم (مثال: SAADA10)"
                    value={couponInput}
                    onChange={(e) => onCouponInputChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  id="apply-coupon-btn"
                  type="button"
                  onClick={onApplyCoupon}
                  className="bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  تطبيق
                </button>
              </div>
              {couponError && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {couponError}
                </p>
              )}
              {appliedCoupon && (
                <p className="text-[11px] text-emerald-600 mt-1.5 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  تم تفعيل كود الخصم: {appliedCoupon.code} (
                  {appliedCoupon.type === 'percentage' || (appliedCoupon.type as string) === 'percent'
                    ? `${appliedCoupon.value}%`
                    : `${appliedCoupon.value} ر.س`}
                  )
                </p>
              )}
            </div>
          )}
        </div>

        {/* نموذج إرسال الطلب */}
        {cart.length > 0 && (
          <form
            onSubmit={onCheckout}
            className="p-4 bg-slate-50 border-t border-slate-200 space-y-3"
          >
            <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-slate-200/70">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{subtotal.toFixed(2)} ر.س</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم:</span>
                  <span className="font-bold">- {discountAmount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>الإجمالي:</span>
                <span className="text-amber-600">{finalTotal.toFixed(2)} ر.س</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <input
                id="checkout-name-input"
                type="text"
                required
                placeholder="الاسم الكريم *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                id="checkout-phone-input"
                type="tel"
                required
                placeholder="رقم الجوال (05xxxxxxx) *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                id="checkout-address-input"
                type="text"
                placeholder="العنوان أو ملاحظات الاستلام (اختياري)"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              id="submit-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98 transition-all"
            >
              {isSubmitting ? (
                <span>جاري إرسال الطلب...</span>
              ) : (
                <>
                  <span>إرسال طلب التجهيز للموظف</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
