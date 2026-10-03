import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { db } from '../firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { Layers, Plus, Edit2, Trash2, Search, Calculator, CheckCircle, Package, DollarSign, Image as ImageIcon } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  onRefresh: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ products: initialProducts, onRefresh }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Herramientas y CNC');
  
  // Currency and cost states
  const [costCurrency, setCostCurrency] = useState<'USD' | 'ARS'>('USD');
  const [costPrice, setCostPrice] = useState<number>(150);
  const [freightCost, setFreightCost] = useState<number>(20);
  const [importDuties, setImportDuties] = useState<number>(30);
  const [exchangeRate, setExchangeRate] = useState<number>(1250);
  
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(40); // % de ganancia
  const [taxIVA, setTaxIVA] = useState<number>(21); // % IVA
  const [finalPriceARS, setFinalPriceARS] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(3);
  const [supplier, setSupplier] = useState('Shenzhen TechGlobal');
  const [containerBatch, setContainerBatch] = useState('CONT-2026-A1');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Automatic calculation of final price ARS considering currency (USD vs ARS) & Exchange rate
  useEffect(() => {
    let costInARS = 0;
    let freightInARS = 0;
    let dutiesInARS = 0;

    const rate = Number(exchangeRate) || 1250;

    if (costCurrency === 'USD') {
      costInARS = Number(costPrice) * rate;
      freightInARS = Number(freightCost) * rate;
      dutiesInARS = Number(importDuties) * rate;
    } else {
      costInARS = Number(costPrice);
      freightInARS = Number(freightCost);
      dutiesInARS = Number(importDuties);
    }

    const totalCostARS = costInARS + freightInARS + dutiesInARS;
    const withProfit = totalCostARS * (1 + Number(profitMarginPercent) / 100);
    const withIVA = withProfit * (1 + Number(taxIVA) / 100);
    setFinalPriceARS(Math.round(withIVA));
  }, [costCurrency, costPrice, freightCost, importDuties, exchangeRate, profitMarginPercent, taxIVA]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setTitle('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategory('Herramientas y CNC');
    setCostCurrency('USD');
    setCostPrice(150);
    setFreightCost(20);
    setImportDuties(30);
    setExchangeRate(1250);
    setProfitMarginPercent(40);
    setTaxIVA(21);
    setStock(15);
    setMinStock(3);
    setSupplier('Shenzhen TechGlobal');
    setContainerBatch('CONT-2026-A1');
    setImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSku(p.sku);
    setCategory(p.category);
    setCostCurrency('USD');
    setCostPrice(p.costPriceUSD || 150);
    setFreightCost(p.freightCostUSD || 20);
    setImportDuties(p.importDutiesUSD || 30);
    setExchangeRate(p.exchangeRate || 1250);
    setProfitMarginPercent(40);
    setTaxIVA(21);
    setFinalPriceARS(p.finalPriceARS);
    setStock(p.stock);
    setMinStock(p.minStock);
    setSupplier(p.supplier || 'Shenzhen TechGlobal');
    setContainerBatch(p.containerBatch || 'CONT-2026-A1');
    setImageUrl(p.imageUrl);
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setSuccess('Producto eliminado con éxito.');
      setTimeout(() => setSuccess(''), 3000);
      onRefresh();
    } catch (e) {
      alert('Error al eliminar producto.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sku.trim()) return;

    const rate = Number(exchangeRate) || 1250;
    const finalCostUSD = costCurrency === 'USD' ? Number(costPrice) : Number(costPrice) / rate;
    const finalFreightUSD = costCurrency === 'USD' ? Number(freightCost) : Number(freightCost) / rate;
    const finalDutiesUSD = costCurrency === 'USD' ? Number(importDuties) : Number(importDuties) / rate;

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title,
      sku,
      category,
      costPriceUSD: finalCostUSD,
      freightCostUSD: finalFreightUSD,
      importDutiesUSD: finalDutiesUSD,
      exchangeRate: Number(exchangeRate),
      finalPriceARS: Number(finalPriceARS),
      stock: Number(stock),
      minStock: Number(minStock),
      supplier,
      containerBatch,
      imageUrl,
      description,
      active: true,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'products', productData.id), productData);
      setIsModalOpen(false);
      setSuccess(editingProduct ? 'Producto actualizado con éxito.' : 'Producto creado con éxito.');
      setTimeout(() => setSuccess(''), 3000);
      onRefresh();
    } catch (e) {
      alert('Error al guardar el producto.');
    }
  };

  const categories = ['todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/10 glow-cyan">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Layers className="w-7 h-7 text-cyan-400" /> Inventario, Costos & Importación
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Gestión detallada de costos (Dólares o Pesos con pesificación automática), márgenes de ganancia y precio final en ARS.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {success && (
            <div className="flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-xs font-black uppercase">
              <CheckCircle className="w-4 h-4" /> {success}
            </div>
          )}
          <button
            onClick={handleOpenAdd}
            className="flex-1 md:flex-none bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider glow-cyan shadow-xl transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto Importado
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por SKU o título..."
            className="w-full bg-[#121624] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition shadow-inner"
          />
        </div>

        <div className="flex overflow-x-auto w-full md:w-auto gap-2 pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white glow-cyan shadow-lg'
                  : 'bg-[#121624] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121624] text-slate-400 uppercase font-black tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Producto / SKU</th>
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6">Costo Total (USD Equiv.)</th>
                <th className="py-4 px-6">Tipo Cambio</th>
                <th className="py-4 px-6">Precio Venta (ARS)</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-200">
              {filtered.map(p => {
                const totalCostUSD = (p.costPriceUSD || 0) + (p.freightCostUSD || 0) + (p.importDutiesUSD || 0);
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.title} className="w-12 h-12 object-cover rounded-xl bg-black/40 border border-white/10" />
                        <div>
                          <p className="font-black text-white">{p.title}</p>
                          <p className="font-mono text-[10px] text-cyan-400">SKU: {p.sku} | Lote: {p.containerBatch || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 uppercase text-[10px] font-bold text-slate-300">{p.category}</td>
                    <td className="py-4 px-6 font-mono font-bold text-cyan-400">${totalCostUSD.toFixed(2)} USD</td>
                    <td className="py-4 px-6 font-mono text-slate-300">${p.exchangeRate || 1250} ARS</td>
                    <td className="py-4 px-6 font-mono font-black text-emerald-400 text-sm">${p.finalPriceARS.toLocaleString('es-AR')} ARS</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        p.stock <= p.minStock ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition"
                          title="Editar Costos y Producto"
                        >
                          <Edit2 className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2.5 bg-white/5 hover:bg-rose-500/20 rounded-xl text-slate-300 hover:text-rose-400 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal - FIXED SCROLLING AND STICKY CLOSE BUTTON */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-8 overflow-y-auto">
          <div className="glass-card rounded-[2.5rem] max-w-3xl w-full p-6 sm:p-10 text-white relative shadow-2xl border border-white/20 glow-cyan my-6">
            
            {/* Sticky / Absolute Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-300 hover:text-white bg-white/10 hover:bg-rose-600/30 p-3 rounded-full transition shadow-lg z-20"
              title="Cerrar Ventana"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-8 pr-12">
              <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center glow-cyan shrink-0">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black">{editingProduct ? 'Editar Producto & Cálculo de Costos (USD / ARS)' : 'Nuevo Producto & Cálculo de Costos (USD / ARS)'}</h3>
                <p className="text-xs text-slate-400">Seleccione si los costos están en Dólares (con pesificación automática) o Pesos.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Título del Producto</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ej. Laser Engraver Pro 20W"
                    className="w-full bg-[#121624] border border-white/10 text-white px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">SKU / Código</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="Ej. IMP-CNC-20W"
                    className="w-full bg-[#121624] border border-white/10 text-white px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#121624] border border-white/10 text-white px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Proveedor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    className="w-full bg-[#121624] border border-white/10 text-white px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Lote / Contenedor</label>
                  <input
                    type="text"
                    value={containerBatch}
                    onChange={e => setContainerBatch(e.target.value)}
                    className="w-full bg-[#121624] border border-white/10 text-white px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div className="bg-[#121624] p-5 rounded-3xl border border-white/10 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">Imagen del Producto (PC o Celular)</label>
                <div className="flex items-center gap-4">
                  <img src={imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl bg-black/50 border border-white/10" />
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg transition">
                      <ImageIcon className="w-4 h-4" /> Seleccionar Archivo
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="O ingrese URL de imagen..."
                      className="w-full bg-[#07090E] border border-white/10 text-white px-3 py-2 rounded-xl text-[11px] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Calculation Box with Currency Selector */}
              <div className="bg-[#121624] p-6 rounded-3xl border border-cyan-500/30 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-cyan-400" /> Moneda de Costos & Pesificación Automática
                  </h4>
                  <div className="flex items-center bg-[#07090E] p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setCostCurrency('USD')}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition ${
                        costCurrency === 'USD' ? 'bg-cyan-600 text-white glow-cyan' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dólares (USD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCostCurrency('ARS')}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition ${
                        costCurrency === 'ARS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Pesos (ARS)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Costo Unitario ({costCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#07090E] border border-white/10 text-white px-3 py-2.5 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Flete ({costCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={freightCost}
                      onChange={e => setFreightCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#07090E] border border-white/10 text-white px-3 py-2.5 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Aranceles ({costCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={importDuties}
                      onChange={e => setImportDuties(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#07090E] border border-white/10 text-white px-3 py-2.5 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">Tipo Cambio (ARS)</label>
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={e => setExchangeRate(parseFloat(e.target.value) || 1250)}
                      disabled={costCurrency === 'ARS'}
                      className="w-full bg-[#07090E] border border-white/10 text-cyan-300 px-3 py-2.5 rounded-xl text-xs font-mono font-bold disabled:opacity-50"
                    />
                  </div>
                </div>

                {costCurrency === 'USD' && (
                  <div className="bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-xl text-[11px] text-cyan-300 font-medium">
                    💡 <strong>Dolarizado:</strong> Los costos en USD se multiplican automáticamente por el Tipo de Cambio (${exchangeRate} ARS) para obtener el valor pesificado en ARS.
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">% de Ganancia (Markup)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={profitMarginPercent}
                      onChange={e => setProfitMarginPercent(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#07090E] border border-white/10 text-emerald-400 px-3 py-2.5 rounded-xl text-xs font-mono font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">% IVA / Impuestos</label>
                    <input
                      type="number"
                      step="0.5"
                      value={taxIVA}
                      onChange={e => setTaxIVA(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#07090E] border border-white/10 text-cyan-400 px-3 py-2.5 rounded-xl text-xs font-mono font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Precio Venta Final (ARS)</label>
                    <input
                      type="number"
                      value={finalPriceARS}
                      onChange={e => setFinalPriceARS(parseFloat(e.target.value) || 0)}
                      className="w-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 px-3 py-2.5 rounded-xl text-sm font-mono font-black shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#121624] border border-white/10 text-white px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Stock Mínimo Alerta</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={e => setMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#121624] border border-white/10 text-white px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#121624] border border-white/10 text-white px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-black uppercase tracking-wider glow-cyan shadow-xl transition"
              >
                {editingProduct ? 'Guardar Cambios del Producto' : 'Crear Producto Importado'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
