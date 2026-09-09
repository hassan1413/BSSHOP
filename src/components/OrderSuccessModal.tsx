import React from 'react';
import { CheckCircle2, ShoppingBag, Printer, Download, Sparkles, Check, Gift } from 'lucide-react';
import { CartItem } from '../types';

export interface CompletedOrderData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  date: string;
}

interface OrderSuccessModalProps {
  orderNumber: string | null;
  orderData?: CompletedOrderData | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderNumber,
  orderData,
  onClose
}) => {
  if (!orderNumber) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="order-success-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-slate-100 my-auto max-h-[94vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:p-0">
        {/* رأس التنبيه */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h3 className="font-black text-xl text-slate-900">تم إرسال طلبك بنجاح!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            وصل طلبك إلى شاشة الموظف في الفرع وجارٍ تجهيزه ومطابقة الأصناف الآن.
          </p>
        </div>

        {/* بطاقة الفاتورة الصادرة الرسمية المثبتة بصور المقاسات */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs print:border-slate-300 print:bg-white">
          {/* ترويسة الفاتورة */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">الفاتورة الصادرة</span>
              <span className="text-sm sm:text-base font-black text-amber-600 font-mono">
                {orderNumber}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block">التاريخ والوقت</span>
              <span className="text-xs font-bold text-slate-700">
                {orderData?.date || new Date().toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>

          {/* بيانات العميل */}
          {orderData && (
            <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200/60 print:border-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">العميل الكريم:</span>
                <span className="font-bold text-slate-800">{orderData.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">رقم الجوال:</span>
                <span className="font-bold text-slate-800 font-mono" dir="ltr">{orderData.customerPhone}</span>
              </div>
              {orderData.deliveryAddress && (
                <div className="col-span-2 pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block">ملاحظات الاستلام / العنوان:</span>
                  <span className="text-slate-700">{orderData.deliveryAddress}</span>
                </div>
              )}
            </div>
          )}

          {/* قائمة عناصر الفاتورة مع تثبيت صورة المقاس الفعلي لكل صنف */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-700 px-1">
              <span>الأصناف المطلوبة (بالمقاس والصورة المحددة)</span>
              <span>{orderData?.items.reduce((sum, item) => sum + item.quantity, 0) || 0} قطع</span>
            </div>

            <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200/70 overflow-hidden max-h-56 overflow-y-auto">
              {orderData?.items.map((item, idx) => (
                <div key={item.id || idx} className="p-2.5 flex items-center gap-3">
                  {/* صورة المقاس الفعلي المعتمدة للطلب */}
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-600 bg-amber-50">
                        <Gift className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 truncate">
                      {item.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {item.selectedSize ? (
                        <span className="text-[10px] font-bold bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/80">
                          المقاس: {item.selectedSize.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          حجم قياسي
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 font-bold">
                        × {item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="font-black text-xs text-slate-900 block">
                      {(item.price * item.quantity).toFixed(2)} ر.س
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({item.price} للقطعة)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* حسابات الإجمالي */}
          {orderData && (
            <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-slate-200/70">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{orderData.subtotal.toFixed(2)} ر.س</span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم المطبق:</span>
                  <span className="font-bold">- {orderData.discount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-1.5 border-t border-slate-100">
                <span>المبلغ الإجمالي المطلوب:</span>
                <span className="text-amber-600">{orderData.totalAmount.toFixed(2)} ر.س</span>
              </div>
            </div>
          )}

          {/* إشعار الاستلام */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-[11px] text-amber-900 text-right leading-relaxed flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>يرجى إبراز رقم الفاتورة أو هذا الإيصال عند الاستلام لمطابقة المقاس واستلام الطلب.</span>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-2 pt-1 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الفاتورة</span>
          </button>

          <button
            id="continue-shopping-btn"
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-md cursor-pointer active:scale-98"
          >
            متابعة التسوق
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
