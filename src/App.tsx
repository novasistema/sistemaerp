import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order } from './types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { seedDatabaseIfEmpty, initialProducts, initialOrders } from './seedData';

import { Navbar } from './components/Navbar';
import { Storefront } from './components/Storefront';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { Dashboard } from './components/Dashboard';
import { InventoryManager } from './components/InventoryManager';
import { SupplierManager } from './components/SupplierManager';
import { ClientsManager } from './components/ClientsManager';
import { PriceListManager } from './components/PriceListManager';
import { WarehouseManager } from './components/WarehouseManager';
import { InvoicingManager } from './components/InvoicingManager';
import { MercadoPagoManager } from './components/MercadoPagoManager';
import { ReportsManager } from './components/ReportsManager';
import { CompanySettingsManager } from './components/CompanySettingsManager';
import { Lock, LogIn } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'ecommerce' | 'erp'>('ecommerce');
  const [erpTab, setErpTab] = useState<'dashboard' | 'invoicing' | 'inventory' | 'suppliers' | 'clients' | 'pricelists' | 'warehouse' | 'mercadopago' | 'reports' | 'settings'>('dashboard');

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ displayName: string; role: string } | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        await seedDatabaseIfEmpty();
      } catch (e) {
        console.warn("Using local fallback data due to offline/network mode.");
      }
    };
    initApp();

    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      snapshot => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => doc.data() as Product);
          setProducts(list);
        }
      },
      error => console.warn("Products offline fallback:", error)
    );

    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      snapshot => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => doc.data() as Order);
          setOrders(list);
        }
      },
      error => console.warn("Orders offline fallback:", error)
    );

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id === productId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean) as CartItem[]);
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'Pagado' || o.status === 'En Preparación').length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white">
      <Navbar
        viewMode={viewMode}
        setViewMode={(mode) => {
          if (mode === 'erp' && !currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          setViewMode(mode);
        }}
        erpTab={erpTab}
        setErpTab={setErpTab}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
      />

      <main className="flex-1 w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {viewMode === 'ecommerce' ? (
          <Storefront products={products} onAddToCart={handleAddToCart} />
        ) : !currentUser ? (
          <div className="max-w-md mx-auto my-20 glass-card p-10 rounded-[3rem] text-center space-y-6 border border-white/10 glow-indigo shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-3xl flex items-center justify-center mx-auto glow-indigo border border-white/20">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Sistema Protegido</h2>
              <p className="text-slate-400 text-xs font-medium">Debe iniciar sesión con su nombre de usuario y contraseña para acceder al Sistema ERP de Gestión.</p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-xs font-black uppercase tracking-wider glow-indigo shadow-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Iniciar Sesión ERP
            </button>
          </div>
        ) : (
          <div>
            {erpTab === 'dashboard' && <Dashboard products={products} orders={orders} />}
            {erpTab === 'invoicing' && <InvoicingManager orders={orders} />}
            {erpTab === 'inventory' && <InventoryManager products={products} onRefresh={() => {}} />}
            {erpTab === 'suppliers' && <SupplierManager />}
            {erpTab === 'clients' && <ClientsManager />}
            {erpTab === 'pricelists' && <PriceListManager products={products} />}
            {erpTab === 'warehouse' && <WarehouseManager orders={orders} onRefresh={() => {}} />}
            {erpTab === 'mercadopago' && <MercadoPagoManager />}
            {erpTab === 'reports' && <ReportsManager products={products} orders={orders} />}
            {erpTab === 'settings' && <CompanySettingsManager />}
          </div>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderSuccess={(newOrder) => {
          setCart([]);
          setOrders(prev => [newOrder, ...prev]);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        products={products}
      />
    </div>
  );
}
