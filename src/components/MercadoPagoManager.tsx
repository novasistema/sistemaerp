import React, { useState, useEffect } from 'react';
import { MercadoPagoTransaction } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DollarSign, ShieldCheck, CreditCard, RefreshCw, CheckCircle } from 'lucide-react';

export const MercadoPagoManager: React.FC = () => {
  const [transactions, setTransactions] = useState<MercadoPagoTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'mercado_pago_transactions'));
      const list = snap.docs.map(doc => doc.data() as MercadoPagoTransaction);
      setTransactions(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'mercado_pago_transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalRevenue = transactions.reduce((acc, tx) => acc + (tx.status === 'approved' ? tx.amount : 0), 0);
  const totalFees = transactions.reduce((acc, tx) => acc + (tx.status === 'approved' ? tx.fee : 0), 0);
  const netAmount = totalRevenue - totalFees;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-sky-400" /> Control de Dinero & Mercado Pago
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Conciliación de ingresos, comisiones de pasarela y estado de cuenta de la importadora.
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {/* Account Linked Status Banner */}
      <div className="bg-sky-950/40 border border-sky-800/60 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/40 rounded-2xl flex items-center justify-center text-sky-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Cuenta Mercado Pago Vinculada</h3>
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Conectado (OAuth)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">ID Cliente: APP_MP_982347192384791 | Titular: ImportPro S.A.</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Disponible para Retiro</span>
          <span className="text-2xl font-extrabold text-emerald-400">${netAmount.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs text-slate-400 block">Total Bruto Ingresado</span>
          <span className="text-2xl font-extrabold text-white">${totalRevenue.toLocaleString('es-AR')}</span>
          <span className="text-[10px] text-emerald-400 block">+100% de transacciones aprobadas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs text-slate-400 block">Comisiones Pasarela (3.99%)</span>
          <span className="text-2xl font-extrabold text-rose-400">-${totalFees.toLocaleString('es-AR')}</span>
          <span className="text-[10px] text-slate-500 block">Retenciones impositivas incluidas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs text-slate-400 block">Neto Recibido</span>
          <span className="text-2xl font-extrabold text-cyan-400">${netAmount.toLocaleString('es-AR')}</span>
          <span className="text-[10px] text-cyan-400 block">Disponible en cuenta</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Historial de Transacciones Mercado Pago</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">ID Pago MP</th>
                <th className="p-4">Orden Relacionada</th>
                <th className="p-4">Comprador</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Monto Bruto</th>
                <th className="p-4">Comisión</th>
                <th className="p-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-white font-mono">{tx.paymentId}</td>
                  <td className="p-4 font-mono text-cyan-400">{tx.orderId}</td>
                  <td className="p-4">{tx.payerEmail}</td>
                  <td className="p-4 text-slate-400">{new Date(tx.dateApproved).toLocaleString('es-AR')}</td>
                  <td className="p-4 font-mono font-extrabold text-emerald-400">${tx.amount.toLocaleString('es-AR')}</td>
                  <td className="p-4 font-mono text-rose-400">-${tx.fee.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
