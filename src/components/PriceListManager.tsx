import React, { useState } from 'react';
import { Product } from '../types';
import { Tag, Printer, Search, Layers, DollarSign } from 'lucide-react';

interface PriceListManagerProps {
  products: Product[];
}

export const PriceListManager: React.FC<PriceListManagerProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<'Minorista' | 'Mayorista' | 'Distribuidor'>('Mayorista');

  const getTierPrice = (basePrice: number, tier: string) => {
    if (tier === 'Distribuidor') return Math.round(basePrice * 0.70); // 30% discount
    if (tier === 'Mayorista') return Math.round(basePrice * 0.85); // 15% discount
    return basePrice; // Minorista
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-white/10 glow-cyan">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Tag className="w-7 h-7 text-cyan-400" /> Listas de Precios Oficiales
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Generador automático de listas de precios por categoría y nivel de cliente (Minorista, Mayorista, Distribuidor).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition glow-cyan shadow-xl"
        >
          <Printer className="w-4 h-4" /> Imprimir / Exportar Lista
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-cyan-400" />
          <input
            type="text"
            placeholder="Buscar producto para lista..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#121624] border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 bg-[#121624] p-1.5 rounded-2xl border border-white/10 w-full sm:w-auto">
          {(['Minorista', 'Mayorista', 'Distribuidor'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                selectedTier === tier
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white glow-cyan shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tier} {tier === 'Mayorista' ? '(-15%)' : tier === 'Distribuidor' ? '(-30%)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Price List Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        <div className="p-8 border-b border-white/10 bg-[#0A0D18]/60 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-white">LISTA OFICIAL DE PRECIOS - TIER: {selectedTier.toUpperCase()}</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">ImportPro S.A. | Actualizado: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
          <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider">
            {filteredProducts.length} Artículos Vigentes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0A0D18]/90 text-slate-400 uppercase tracking-widest font-black border-b border-white/10">
                <th className="p-5">SKU</th>
                <th className="p-5">Producto / Descripción</th>
                <th className="p-5">Categoría</th>
                <th className="p-5">Lote Contenedor</th>
                <th className="p-5 text-center">Stock</th>
                <th className="p-5 text-right">Precio Vigente ({selectedTier})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
              {filteredProducts.map(product => {
                const tierPrice = getTierPrice(product.finalPriceARS, selectedTier);
                return (
                  <tr key={product.id} className="hover:bg-white/5 transition">
                    <td className="p-5 font-mono font-bold text-cyan-400">{product.sku}</td>
                    <td className="p-5 font-bold text-white text-sm">{product.title}</td>
                    <td className="p-5">
                      <span className="bg-[#121624] border border-white/10 px-3 py-1.5 rounded-xl text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-5 font-mono text-amber-300">{product.containerBatch}</td>
                    <td className="p-5 text-center font-bold text-emerald-400">{product.stock} un.</td>
                    <td className="p-5 text-right font-mono font-black text-emerald-400 text-base">
                      ${tierPrice.toLocaleString('es-AR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
