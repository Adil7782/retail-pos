"use client";

import { useState, useEffect, useRef } from "react";
import {
    Search,
    Trash2,
    Plus,
    Minus,
    X,
    CreditCard,
    Banknote,
    ScanBarcode,
    Scale, // *** ADDED: Icon for weight
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { Product } from "@/data"; <--- Commented out to use local interface for demo

import DashboardLayout from "../../components/DashboardLayout";

// *** CHANGED: Extended the interface to include 'unit'
// Make sure your database/data source actually provides this field!
interface Product {
    id: number;
    name: string;
    barcode: string;
    price: number;
    // 'kg' | 'g' | 'l' | 'ml' | 'pcs'
    unit: string;
}

interface CartItem extends Product {
    qty: number;
}

// *** ADDED: Configuration for Quick Buttons based on Unit Type
const UNIT_PRESETS: Record<string, { label: string; value: number }[]> = {
    kg: [
        { label: "100g", value: 0.1 },
        { label: "250g", value: 0.25 },
        { label: "500g", value: 0.5 },
        { label: "1kg", value: 1 },
        { label: "2kg", value: 2 },
        { label: "5kg", value: 5 },
    ],
    l: [
        { label: "100ml", value: 0.1 }, // Assuming price is per Liter
        { label: "250ml", value: 0.25 },
        { label: "500ml", value: 0.5 },
        { label: "1L", value: 1 },
        { label: "2L", value: 2 },
        { label: "5L", value: 5 },
    ],
    // You can add 'm' for meters (fabric/wires) etc.
};

export default function POSPage({ products }: { products: Product[] }) {
    // --- STATE ---
    const [query, setQuery] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);

    // Navigation & Selection
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Modal / Quantity Logic
    const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [qtyInput, setQtyInput] = useState("1");

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const qtyInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- FILTER LOGIC ---
    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.barcode.includes(query)
    );

    // --- ACTIONS ---

    // 1. Initiate Add (Open Modal)
    const initiateAddToCart = (product: Product) => {
        setPendingProduct(product);
        setQtyInput("1");
        setIsQtyModalOpen(true);
        setIsDropdownOpen(false);
    };

    // 2. Confirm Add (Update Cart)
    const confirmAddToCart = () => {
        if (!pendingProduct) return;

        // *** CHANGED: Use parseFloat instead of parseInt to allow 0.5, 1.25, etc.
        const qtyToAdd = parseFloat(qtyInput);

        if (isNaN(qtyToAdd) || qtyToAdd <= 0) return;

        setCart((prev) => {
            const existing = prev.find((item) => item.id === pendingProduct.id);
            if (existing) {
                // Update existing item
                return prev.map((item) =>
                    item.id === pendingProduct.id
                        ? { ...item, qty: item.qty + qtyToAdd }
                        : item
                );
            }
            // Add new item
            return [...prev, { ...pendingProduct, qty: qtyToAdd }];
        });

        closeQtyModal();
    };

    const closeQtyModal = () => {
        setIsQtyModalOpen(false);
        setPendingProduct(null);
        setQuery(""); // Clear search
        setFocusedIndex(-1);
        setTimeout(() => searchInputRef.current?.focus(), 50);
    };

    // 3. Update Existing Cart Qty
    const updateCartQty = (id: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    // *** CHANGED: Fix floating point math issues (e.g. 0.1 + 0.2 = 0.300000004)
                    const newQty = parseFloat((item.qty + delta).toFixed(3));
                    return { ...item, qty: Math.max(0.001, newQty) }; // allow going low but not 0
                }
                return item;
            })
        );
    };

    // 4. Remove Item
    const removeFromCart = (id: number) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    // --- KEYBOARD HANDLERS ---
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (filteredProducts.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) =>
                prev < filteredProducts.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const exactMatch = products.find((p) => p.barcode === query);
            if (exactMatch) {
                initiateAddToCart(exactMatch);
            } else if (focusedIndex >= 0 && filteredProducts[focusedIndex]) {
                initiateAddToCart(filteredProducts[focusedIndex]);
            } else if (filteredProducts.length === 1) {
                initiateAddToCart(filteredProducts[0]);
            }
        } else if (e.key === "Escape") {
            setIsDropdownOpen(false);
            setFocusedIndex(-1);
        }
    };

    const handleQtyKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            confirmAddToCart();
        } else if (e.key === "Escape") {
            closeQtyModal();
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (isQtyModalOpen) {
            // Select all text when opening so user can type immediately to replace
            setTimeout(() => qtyInputRef.current?.select(), 50);
        }
    }, [isQtyModalOpen]);

    useEffect(() => {
        if (query.length > 0) {
            setIsDropdownOpen(true);
            setFocusedIndex(0);
        } else {
            setIsDropdownOpen(false);
            setFocusedIndex(-1);
        }
    }, [query]);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const total = subtotal;

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4 p-4 bg-slate-50 overflow-hidden">
            {/* --- LEFT SECTION: SEARCH & KEYBOARD INTERFACE --- */}
            <div className="flex-1 flex flex-col gap-4 relative">
                {/* Search Bar Container */}
                <div className="relative z-20">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Scan barcode or type name..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg shadow-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            disabled={isQtyModalOpen}
                            autoComplete="off"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                            <ScanBarcode className="text-slate-400" />
                        </div>
                    </div>

                    {/* Dropdown Suggestions */}
                    {isDropdownOpen && filteredProducts.length > 0 && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-[60vh] overflow-y-auto z-30"
                        >
                            {filteredProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    onClick={() => initiateAddToCart(product)}
                                    className={cn(
                                        "flex justify-between items-center p-4 cursor-pointer border-b border-slate-50 last:border-0",
                                        index === focusedIndex ? "bg-blue-50" : "hover:bg-slate-50"
                                    )}
                                >
                                    <div>
                                        <div className="font-medium text-slate-800">{product.name}</div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>#{product.barcode}</span>
                                            {/* Show Unit Badge */}
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium uppercase">
                                                {product.unit}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="font-semibold text-blue-600">
                                        Rs.{product.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Helper Text */}
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                    <div className="text-center space-y-2">
                        <p>Scan a product or type to search.</p>
                        <div className="flex gap-2 justify-center text-xs">
                            <span className="px-2 py-1 bg-white border rounded">↑/↓ Navigate</span>
                            <span className="px-2 py-1 bg-white border rounded">↵ Select</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SECTION: CART --- */}
            <div className="w-full md:w-[400px] bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full z-10">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <h2 className="font-bold text-lg text-slate-800">Current Order</h2>
                    <p className="text-sm text-slate-500">
                        {cart.length} distinct items
                    </p>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <ScanBarcode size={48} className="opacity-20" />
                            <p>Order is empty</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-slate-700 w-3/4 truncate">
                                        {item.name}
                                    </span>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-300 hover:text-red-500 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                        <button
                                            // *** CHANGED: Allow small decrements for weight items, 1 for others
                                            onClick={() => updateCartQty(item.id, item.unit === 'pcs' ? -1 : -0.1)}
                                            className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-200 transition"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-sm font-semibold min-w-[30px] text-center">
                                            {item.qty}
                                            <span className="text-[10px] text-slate-400 ml-0.5">{item.unit}</span>
                                        </span>
                                        <button
                                            onClick={() => updateCartQty(item.id, item.unit === 'pcs' ? 1 : 0.1)}
                                            className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-200 transition"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-800">
                                            Rs.{(item.price * item.qty).toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            Rs.{item.price}/{item.unit}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Totals */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl space-y-3">
                    <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>Rs.{subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-2xl text-blue-600">
                            Rs.{total.toFixed(2)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                            onClick={() => setCart([])}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                        >
                            <Trash2 size={18} /> Cancel
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                            <CreditCard size={18} /> Charge
                        </button>
                    </div>
                </div>
            </div>

            {/* --- QUANTITY POPUP DIALOG --- */}
            {isQtyModalOpen && pendingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Enter Quantity</h3>
                                <p className="text-sm text-slate-500">{pendingProduct.name}</p>
                            </div>
                            <button onClick={closeQtyModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Input Field */}
                            <div className="relative">
                                <input
                                    ref={qtyInputRef}
                                    type="number"
                                    step="0.001" // *** IMPORTANT: Allows 3 decimal places
                                    min="0.001"
                                    value={qtyInput}
                                    onChange={(e) => setQtyInput(e.target.value)}
                                    onKeyDown={handleQtyKeyDown}
                                    className="w-full text-center text-4xl font-bold py-4 border-b-2 border-blue-500 outline-none bg-transparent"
                                />
                                <span className="absolute right-0 bottom-4 text-slate-400 font-medium text-lg uppercase">
                                    {pendingProduct.unit}
                                </span>
                            </div>

                            {/* *** CHANGED: Quick Select Buttons for Kg/L *** */}
                            {UNIT_PRESETS[pendingProduct.unit] && (
                                <div className="grid grid-cols-3 gap-2">
                                    {UNIT_PRESETS[pendingProduct.unit].map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => {
                                                setQtyInput(preset.value.toString());
                                                // Optional: Focus back on input or just keep focus on buttons
                                                qtyInputRef.current?.focus();
                                            }}
                                            className={cn(
                                                "py-2 rounded-lg text-sm font-semibold border transition",
                                                parseFloat(qtyInput) === preset.value
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                            )}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={closeQtyModal}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 font-medium hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAddToCart}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                                >
                                    Confirm (↵)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}