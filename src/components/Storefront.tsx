import React, { useState } from 'react';
import { Product } from '../types';
import { Search, ShoppingCart, Star, Shield, Zap, Sparkles, SlidersHorizontal, Check, Eye } from 'lucide-react';

interface StorefrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ products, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-20">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden glass-card rounded-[3rem] p-8 sm:p-14 border border-white/10 glow-indigo shadow-2xl bg-gradient-to-r from-[#0F1322] via-[#161B30] to-[#0A0D18]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
            <Shield className="w-4 h-4" /> Facturación Automatizada
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
            Tecnología & <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Gaming</span> de Alta Gama
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            Catálogo exclusivo con cotización en Pesos (ARS), importación directa optimizada y stock garantizado en tiempo real.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#catalogo"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider glow-indigo shadow-xl transition inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Ver Catálogo
            </a>
          </div>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div id="catalogo" className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por producto, SKU o categoría..."
              className="w-full bg-[#121624] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white font-medium focus:outline-none focus:border-violet-500 transition shadow-inner"
            />
          </div>

          {/* Categories Pill Bar */}
          <div className="flex overflow-x-auto w-full md:w-auto gap-2 pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white glow-indigo shadow-lg'
                    : 'bg-[#121624] text-slate-400 hover:text-white border border-white/5 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all duration-300 group flex flex-col justify-between shadow-xl"
            >
              <div className="relative h-64 bg-black/40 overflow-hidden flex items-center justify-center p-6">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-4 right-4 bg-[#07090E]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-cyan-400 border border-white/10">
                  SKU: {product.sku}
                </div>
                {product.stock <= product.minStock && (
                  <div className="absolute top-4 left-4 bg-amber-500/90 text-slate-950 font-black px-3 py-1 rounded-xl text-[10px] uppercase">
                    Stock Bajo
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400">
                    {product.category}
                  </span>
                  <h3 className="text-base font-black text-white group-hover:text-violet-300 transition line-clamp-2">
                    {product.title}
                  </h3>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Precio Final ARS</span>
                      <span className="text-xl font-black font-mono text-emerald-400">${product.finalPriceARS.toLocaleString('es-AR')}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Stock: {product.stock}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="py-3 bg-[#121624] hover:bg-[#1C2338] border border-white/10 text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detalle
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Comprar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="glass-card rounded-[2.5rem] max-w-2xl w-full p-8 text-white relative shadow-2xl border border-white/20 glow-indigo my-8">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/10 p-2.5 rounded-full"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div className="h-72 bg-black/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-white/10">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-violet-400">{selectedProduct.category}</span>
                  <h2 className="text-2xl font-black mt-1">{selectedProduct.title}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">SKU: {selectedProduct.sku}</p>
                </div>
                <div className="bg-[#121624] p-4 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Precio Final ARS</span>
                  <p className="text-2xl font-black font-mono text-emerald-400">${selectedProduct.finalPriceARS.toLocaleString('es-AR')} ARS</p>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Producto de alta gama con garantía oficial, importación directa y cotización actualizada en tiempo real.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider glow-indigo shadow-xl transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" /> Agregar al Carrito
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
