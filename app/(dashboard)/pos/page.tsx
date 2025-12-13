"use client";

import { useState, useEffect, useRef } from "react";


import { Search, Trash2, Plus, Minus, ScanBarcode, CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, products } from "@/data";
import DashboardLayout from "../../components/DashboardLayout";

// Interface for items specifically in the cart
interface CartItem extends Product {
  qty: number;
}

export default function POSPage() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Filter products for the visual grid
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode.includes(query)
  );

  // 2. Add to Cart Logic
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // If exists, increment qty
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // If new, add with qty 1
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // 3. Handle Quantity Updates
  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, qty: Math.max(1, item.qty + delta) };
        }
        return item;
      })
    );
  };

  // 4. Remove Item
  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // 5. Handle Barcode Scanner "Enter" Key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Find exact match by barcode
      const exactMatch = products.find((p) => p.barcode === query);
      if (exactMatch) {
        addToCart(exactMatch);
        setQuery(""); // Clear for next scan
      }
    }
  };

  // 6. Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Auto-focus search on load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (

    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">

      {/* LEFT SECTION: PRODUCT GRID */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <Search className="text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Scan barcode or type product name..."
            className="flex-1 outline-none text-lg bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <ScanBarcode className="text-slate-400" />
        </div>

        {/* Product Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative flex flex-col justify-between p-4 border border-slate-100 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition bg-slate-50 hover:bg-white"
              >
                <div className="space-y-2">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm mb-2", product.color)}>
                    {product.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-slate-700 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400">#{product.barcode}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
                  <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition">
                    Add
                  </span>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-slate-400 h-64">
                <Search size={48} className="mb-4 opacity-20" />
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: BILLING / CART */}
      <div className="w-full lg:w-[400px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="font-bold text-lg text-slate-800">Current Order</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            {cart.reduce((acc, i) => acc + i.qty, 0)} Items
          </span>
        </div>

        {/* Cart Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <ScanBarcode size={32} className="opacity-50" />
              </div>
              <p>Order is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-700 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-500">${item.price.toFixed(2)} / unit</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mx-4">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Total & Remove */}
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-sm">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 text-xs mt-1 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Totals & Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl space-y-4">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-slate-200 pt-4">
            <span className="text-slate-500 font-medium">Total Payable</span>
            <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              className="flex items-center justify-center gap-2 py-3 rounded-lg border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
              onClick={() => setCart([])} // Reset
            >
              <Banknote size={18} />
              Cash
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
              <CreditCard size={18} />
              Charge
            </button>
          </div>
        </div>

      </div>
    </div>

  );
}