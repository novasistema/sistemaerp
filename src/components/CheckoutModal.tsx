import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { X, CheckCircle, ShieldCheck, DollarSign, CreditCard, Truck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('Carlos Benítez');
  const [customerEmail, setCustomerEmail] = useState('carlos.benitez@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('+54 11 4455-6677');
  const [shippingAddress, setShippingAddress] = useState('Av. Corrientes 1234, CABA, Argentina');
  const [paymentMethod, setPaymentMethod] = useState<'Mercado Pago' | 'Transferencia Bancaria' | 'Efectivo'>('Mercado Pago');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, i) => acc + i.product.finalPriceARS * i.quantity, 0);
  const shipping = 15000;
  const total = subtotal + shipping;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `PED-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: cart.map(i => ({
        productId: i.product.id,
        title: i.product.title,
        sku: i.product.sku,
        quantity: i.quantity,
        price: i.product.finalPriceARS,
      })),
      subtotal,
      shipping,
      total,
      status: paymentMethod === 'Mercado Pago' ? 'Pagado' : 'Pendiente de Pago',
      paymentMethod,
      paymentId: paymentMethod === 'Mercado Pago' ? `MP-${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      setCreatedOrderNumber(orderNumber);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onOrderSuccess(newOrder);
        onClose();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="glass-card rounded-[2.5rem] max-w-xl w-full p-8 text-white relative shadow-2xl border border-white/20 glow-magenta max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/10 p-2.5 rounded-full">
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-16 space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black">¡Pedido Creado en Pesos (ARS)!</h3>
            <p className="text-slate-400 text-xs font-mono">Número de Orden: {createdOrderNumber}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-fuchsia-600/20 border border-fuchsia-500/40 rounded-2xl flex items-center justify-center text-fuchsia-400 glow-magenta">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">Finalizar Compra en Pesos (ARS)</h3>
                <p className="text-xs text-slate-400 font-medium">Complete sus datos de envío y pago en moneda nacional</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nombre y Apellido</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-[#121624] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#121624] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#121624] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Dirección de Envío</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="w-full bg-[#121624] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#121624] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="Mercado Pago">Mercado Pago (Acreditación Instantánea en Pesos)</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria CBU en Pesos</option>
                  <option value="Efectivo">Efectivo contra entrega</option>
                </select>
              </div>
            </div>

            <div className="bg-[#121624] p-5 rounded-2xl border border-white/10 space-y-2 text-xs font-medium">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Ítems:</span>
                <span className="font-mono text-white">${subtotal.toLocaleString('es-AR')} ARS</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Envío Logística:</span>
                <span className="font-mono text-white">${shipping.toLocaleString('es-AR')} ARS</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                <span>Total a Pagar en Pesos:</span>
                <span className="font-mono text-emerald-400">${total.toLocaleString('es-AR')} ARS</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-xs font-black uppercase tracking-wider glow-magenta shadow-xl transition"
            >
              Confirmar Orden por ${total.toLocaleString('es-AR')} ARS
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
