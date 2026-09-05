import React from 'react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

interface OrderSuccessModalProps {
  orderNumber: string | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderNumber,
  onClose
}) => {
  if (!orderNumber) return null;

  return (
    <div
      id="order-success-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-black text-lg text-slate-900">تم إرسال طلبك بنجاح!</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          وصل طلبك إلى شاشة الموظف في الفرع وبدأ التجهيز.
        </p>
        <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
          <span className="text-[11px] text-slate-500 block mb-1">رقم طلبك:</span>
          <span className="text-xl font-black text-amber-600 tracking-wider">
            {orderNumber}
          </span>
        </div>
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-[11px] text-amber-900 text-right leading-relaxed">
          💡 <strong>ملاحظة:</strong> يرجى تزويد الموظف برقم هذا الطلب عند الاستلام لمطابقة الأصناف وإتمام الدفع.
        </div>
        <button
          id="continue-shopping-btn"
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer active:scale-98"
        >
          متابعة التسوق
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
