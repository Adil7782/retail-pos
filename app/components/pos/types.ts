export interface Product {
    id: number;
    name: string;
    barcode?: string | null;
    scalePlu?: string | null;
    isWeighed?: boolean;
    price: number;
    // 'kg' | 'g' | 'l' | 'ml' | 'pcs'
    unit: string | null;
}

export interface CartItem extends Product {
    qty: number;
}

export const OTHER_PRODUCT_ID = 99999;

export const UNIT_PRESETS: Record<string, { label: string; value: number }[]> = {
    kg: [
        { label: "100g", value: 0.1 },
        { label: "250g", value: 0.25 },
        { label: "500g", value: 0.5 },
        { label: "1kg", value: 1 },
        { label: "2kg", value: 2 },
        { label: "5kg", value: 5 },
    ],
    l: [
        { label: "100ml", value: 0.1 },
        { label: "250ml", value: 0.25 },
        { label: "500ml", value: 0.5 },
        { label: "1L", value: 1 },
        { label: "2L", value: 2 },
        { label: "5L", value: 5 },
    ],
};
