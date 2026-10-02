import React, { useState } from 'react';
import { Product } from '../types';
import { ProductModal } from './ProductModal';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Search, Layers, Edit3, Trash2, AlertTriangle, Ship, DollarSign } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  onRefresh: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ products, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.containerBatch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = async (product: Product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este producto del inventario?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-white/10 glow-cyan">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Layers className="w-7 h-7 text-cyan-400" /> Control de Inventario & Importación Quantum
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Gestión en tiempo real de costos FOB, contenedores, fletes y valoración de activos.
          </p>
        </div>
        <button
          onClick={() => {
            setProductToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition glow-cyan shadow-xl"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto Importado
        </button>
      </div>

      {/* Low stock alert banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/50 p-5 rounded-3xl flex items-center gap-4 text-amber-300 shadow-xl">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 animate-bounce" />
          <div className="text-xs font-bold leading-relaxed">
            <span>Alerta de Stock Crítico:</span> Hay {lowStockProducts.length} producto(s) por debajo del stock mínimo recomendado ({lowStockProducts.map(p => p.title).join(', ')}).
          </div>
        </div>
      )}

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-cyan-400" />
          <input
            type="text"
            placeholder="Buscar por SKU, nombre o lote..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#121624] border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="glass-card px-5 py-3 rounded-2xl text-xs">
            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Total Artículos</span>
            <span className="text-white font-black text-base font-mono">{products.length}</span>
          </div>
          <div className="glass-card px-5 py-3 rounded-2xl text-xs">
            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Valorización Inventario</span>
            <span className="text-emerald-400 font-black text-base font-mono">
              ${products.reduce((acc, p) => acc + p.finalPriceARS * p.stock, 0).toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0A0D18]/90 text-slate-400 uppercase tracking-widest font-black border-b border-white/10">
                <th className="p-5">Producto & SKU</th>
                <th className="p-5">Categoría</th>
                <th className="p-5">Contenedor / Lote</th>
                <th className="p-5">Costo Total USD</th>
                <th className="p-5">Precio Venta ARS</th>
                <th className="p-5">Stock</th>
                <th className="p-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
              {filteredProducts.map(product => {
                const totalCostUSD = product.costPriceUSD + product.freightCostUSD + product.importDutiesUSD;
                return (
                  <tr key={product.id} className="hover:bg-white/5 transition">
                    <td className="p-5 flex items-center gap-4">
                      <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-2xl object-cover bg-black/50 border border-white/10 shrink-0" />
                      <div>
                        <p className="font-bold text-white text-sm">{product.title}</p>
                        <p className="text-slate-400 font-mono text-[10px]">SKU: {product.sku}</p>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-[#121624] border border-white/10 px-3 py-1.5 rounded-xl text-cyan-300 font-black tracking-wider uppercase text-[10px]">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="flex items-center gap-1.5 font-mono text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30 w-fit font-bold">
                        <Ship className="w-3.5 h-3.5" /> {product.containerBatch}
                      </span>
                    </td>
                    <td className="p-5 font-mono font-bold text-slate-200">
                      ${totalCostUSD.toFixed(2)} USD
                    </td>
                    <td className="p-5 font-mono font-black text-emerald-400 text-sm">
                      ${product.finalPriceARS.toLocaleString('es-AR')}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] ${
                        product.stock > product.minStock ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                      }`}>
                        {product.stock} un.
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setProductToEdit(product);
                          setIsModalOpen(true);
                        }}
                        className="p-2.5 bg-[#1A2035] hover:bg-[#252E4A] text-slate-300 hover:text-white rounded-xl transition inline-flex border border-white/10"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2.5 bg-[#1A2035] hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 rounded-xl transition inline-flex border border-white/10"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
