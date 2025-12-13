// app/pos/data.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
  category: string;
  stock: number;
  color?: string; // Just for UI decoration
}

export const products: Product[] = [
  { id: 1, name: "Organic Bananas", price: 1.20, barcode: "94001", category: "Fruits", stock: 50, color: "bg-yellow-100 text-yellow-800" },
  { id: 2, name: "Red Apple", price: 0.80, barcode: "94002", category: "Fruits", stock: 100, color: "bg-red-100 text-red-800" },
  { id: 3, name: "Whole Milk (1L)", price: 2.50, barcode: "88001", category: "Dairy", stock: 20, color: "bg-blue-100 text-blue-800" },
  { id: 4, name: "Sourdough Bread", price: 3.50, barcode: "77001", category: "Bakery", stock: 15, color: "bg-amber-100 text-amber-800" },
  { id: 5, name: "Orange Juice", price: 4.00, barcode: "88002", category: "Beverage", stock: 30, color: "bg-orange-100 text-orange-800" },
  { id: 6, name: "Potato Chips", price: 1.99, barcode: "55001", category: "Snacks", stock: 60, color: "bg-purple-100 text-purple-800" },
  { id: 7, name: "Cola Can", price: 1.00, barcode: "55002", category: "Beverage", stock: 100, color: "bg-slate-100 text-slate-800" },
  { id: 8, name: "Soap Bar", price: 1.50, barcode: "33001", category: "Household", stock: 40, color: "bg-pink-100 text-pink-800" },
];