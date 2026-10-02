import React, { useState } from 'react';
import { Product } from '../types';
import { Search, ShoppingBag, ShieldCheck, Truck, Package, Tag, ArrowRight, Eye, Star, Zap } from 'lucide-react';

interface StorefrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ products, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.active;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#0F1423] via-[#1A103C] to-[#0A0D18] text-white rounded-[2.5rem] overflow-hidden border border-white/10 glow-indigo shadow-2xl p-8 sm:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.2),transparent_60%)]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" /> Importación Directa Quantum-Grade
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
            Tecnología e Insumos Industriales de Vanguardia
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
            Suministro global con trazabilidad por contenedor, control de costos en tiempo real y distribución instantánea en toda la región.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 px-4 py-2.5 rounded-2xl border border-cyan-500/30 glow-cyan">
              <Truck className="w-4 h-4 text-cyan-400" /> Logística Global Express
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-4 py-2.5 rounded-2xl border border-emerald-500/30 glow-emerald">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Facturación AFIP Automatizada
            </div>
          </div>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-fuchsia-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121624] border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:border-fuchsia-500 transition shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white glow-magenta shadow-lg'
                    : 'bg-[#121624] border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="glass-card glass-card-hover rounded-[2.5pax] sm:rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col group relative"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition duration-500"></div>

            <div className="relative h-60 bg-[#0A0D18] overflow-hidden">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute top-3.5 left-3.5 bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg">
                {product.category}
              </div>
              <div className="absolute top-3.5 right-3.5 bg-black/70 backdrop-blur-md border border-white/10 text-amber-300 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                Lote: {product.containerBatch}
              </div>
            </div>

            <div className="p-7 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">SKU: {product.sku}</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                    product.stock > product.minStock ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                  }`}>
                    Stock: {product.stock} un.
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-fuchsia-400 transition tracking-tight leading-snug">
                  {product.title}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              <div className="pt-5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block">Precio Final ARS</span>
                  <span className="text-2xl font-black text-white font-mono bg-gradient-to-r from-white via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">
                    ${product.finalPriceARS.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-3 bg-[#1A2035] hover:bg-[#252E4A] text-slate-300 hover:text-white rounded-2xl transition border border-white/10"
                    title="Ver detalle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition glow-indigo shadow-lg"
                  >
                    <ShoppingBag className="w-4 h-4" /> Comprar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-24 glass-card rounded-[2.5rem]">
          <Package className="w-16 h-16 text-fuchsia-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-black text-white">No se encontraron productos</h3>
          <p className="text-slate-400 text-sm mt-1 font-medium">Prueba con otra búsqueda o categoría.</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="glass-card rounded-[2.5rem] max-w-2xl w-full p-8 text-white relative shadow-2xl max-h-[90vh] overflow-y-auto border border-white/20 glow-magenta">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/10 p-2.5 rounded-full transition"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-72 md:h-full rounded-2xl overflow-hidden bg-black/50 border border-white/10">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-3.5 py-1.5 rounded-full inline-block">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-2xl font-black mt-3 leading-tight">{selectedProduct.title}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">SKU: {selectedProduct.sku} | Lote: {selectedProduct.containerBatch}</p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedProduct.description}</p>

                <div className="bg-[#121624] p-5 rounded-2xl border border-white/10 space-y-3 font-medium">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Proveedor Importación:</span>
                    <span className="text-white font-bold">{selectedProduct.supplier}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Stock Disponible:</span>
                    <span className="text-emerald-400 font-bold">{selectedProduct.stock} unidades</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-500 block">Total</span>
                    <span className="text-3xl font-black text-white font-mono">${selectedProduct.finalPriceARS.toLocaleString('es-AR')}</span>
                  </div>
                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg glow-indigo transition"
                  >
                    <ShoppingBag className="w-4 h-4" /> Agregar al Carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
