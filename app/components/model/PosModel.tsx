"use client";

import { useState } from "react";
import { Product, CartItem, OTHER_PRODUCT_ID } from "@/app/components/pos/types";
import { useEffect, useCallback } from "react";
import POSSearchSection from "@/app/components/pos/POSSearchSection";
import POSCartSection from "@/app/components/pos/POSCartSection";
import POSQuantityModal from "@/app/components/pos/POSQuantityModal";
import POSPaymentModal from "@/app/components/pos/POSPaymentModal";

export default function POSPage({ products }: { products: Product[] }) {
    // --- STATE ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [activeCartItemId, setActiveCartItemId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Derived State
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const total = subtotal;

    // --- ACTIONS ---

    // 1. Initiate Add (Open Modal) or Direct Add
    const initiateAddToCart = (product: Product, quantity?: number) => {
        if (quantity !== undefined && quantity > 0) {
            handleConfirmAdd(product, quantity, product.price);
            return;
        }
        setPendingProduct(product);
        setModalMode('add');
        setIsQtyModalOpen(true);
    };

    // New: Edit Cart Item
    const initiateEditCartItem = (item: CartItem) => {
        setPendingProduct(item);
        setModalMode('edit');
        setIsQtyModalOpen(true);
    };

    // 2. Confirm Add/Edit (Update Cart)
    const handleConfirmAdd = (product: Product, qtyInput: number, priceInput: number) => {
        setCart((prev) => {
            // CASE 1: EDIT MODE - Update specific item
            if (modalMode === 'edit') {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, qty: qtyInput, price: priceInput }
                        : item
                );
            }

            // CASE 2: ADD "OTHER" ITEM - Always creates new entry
            if (product.id === OTHER_PRODUCT_ID) {
                const newItem: CartItem = {
                    ...product,
                    id: Date.now(), // Generate unique ID
                    price: priceInput,
                    qty: qtyInput,
                    name: "Manual Item"
                };
                return [...prev, newItem];
            }

            // CASE 3: ADD NORMAL ITEM
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                // Update existing item
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + qtyInput } // Add to existing qty
                        : item
                );
            }
            // Add new item
            return [...prev, { ...product, qty: qtyInput, price: priceInput }];
        });

        closeQtyModal();
    };

    const closeQtyModal = () => {
        console.log("closeQtyModal");

        setIsQtyModalOpen(false);
        setPendingProduct(null);
        setModalMode('add');
        setActiveCartItemId(null);
    };



    // 3. Update Existing Cart Qty
    const updateCartQty = (id: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    // Fix floating point math (e.g. 0.1 + 0.2 = 0.300000004)
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

    // 5. Transaction Flow
    const openPaymentModal = () => {
        if (cart.length === 0) return;
        setIsPaymentModalOpen(true);
    };

    const processTransaction = async (receivedAmount: number) => {
        setIsLoading(true);
        try {
            const payload = {
                items: cart.map(item => ({
                    id: item.id,
                    qty: item.qty,
                    price: item.price
                })),
                subTotal: subtotal,
                tax: 0,
                discount: 0,
                totalAmount: total,
                paymentMethod: "CASH",
                receivedAmount, // Optional: if backend tracks this
                changeAmount: receivedAmount - total // Optional
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Transaction failed");
            }

            // Success
            const data = await res.json();
            // Optional: Show success toast or small notification instead of alert?
            // For now, alert is fine as it blocks interaction until dismissed
            alert("Transaction Successful! Order ID: " + data.id);

            setCart([]);
            setIsPaymentModalOpen(false);

        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert("Checkout Failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F10") {
                e.preventDefault();
                if (activeCartItemId) {
                    const item = cart.find(i => i.id === activeCartItemId);
                    if (item) {
                        initiateEditCartItem(item);
                    }
                }
            } else if (e.key === "F11") {
                e.preventDefault();
                openPaymentModal();
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [activeCartItemId, cart]);

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4 p-4 bg-slate-50 overflow-hidden">
            {/* --- LEFT SECTION: SEARCH & KEYBOARD INTERFACE --- */}
            <POSSearchSection
                products={products}
                onProductSelect={initiateAddToCart}
                isLocked={isQtyModalOpen || isPaymentModalOpen}
            />

            {/* --- RIGHT SECTION: CART --- */}
            <POSCartSection
                cart={cart}
                activeItemId={activeCartItemId}
                onSelect={(id) => setActiveCartItemId(id)}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
                onClearCart={() => setCart([])}
                onCheckout={openPaymentModal}
                isLoading={isLoading}
            />

            {/* --- QUANTITY POPUP DIALOG --- */}
            <POSQuantityModal
                isOpen={isQtyModalOpen}
                product={pendingProduct}
                initialQty={modalMode === 'edit' && pendingProduct ? (pendingProduct as CartItem).qty : 1}
                allowPriceEdit={modalMode === 'edit' || (pendingProduct?.id === OTHER_PRODUCT_ID)}
                onClose={closeQtyModal}
                onConfirm={handleConfirmAdd}
            />

            {/* --- PAYMENT POPUP DIALOG --- */}
            <POSPaymentModal
                isOpen={isPaymentModalOpen}
                total={total}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={processTransaction}
                isLoading={isLoading}
            />
        </div>
    );
}