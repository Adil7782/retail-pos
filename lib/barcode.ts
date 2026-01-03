/**
 * Parses a Weight-Embedded Barcode (EAN-13 Restricted Circulation)
 * Format: PP IIIII WWWWW C
 * PP: Prefix (21 for weighted items)
 * IIIII: Scale PLU (5 digits)
 * WWWWW: Weight in grams (5 digits)
 * C: Check digit
 */
export interface ParsedBarcode {
    isWeighted: boolean;
    scalePlu?: string;
    weight?: number; // in Kg
    originalCode: string;
}

export function parseBarcode(code: string): ParsedBarcode {
    // 1. Basic validation: Must be 12 or 13 digits and numeric
    if (!code || (code.length !== 13 && code.length !== 12) || !/^\d+$/.test(code)) {
        return { isWeighted: false, originalCode: code };
    }

    // 2. Check Prefix
    const prefix = code.substring(0, 2);
    if (prefix !== '21') {
        return { isWeighted: false, originalCode: code };
    }

    // 3. Extract Parts
    const plu = code.substring(2, 7); // Digits 3-7 (Index 2-6)
    const weightStr = code.substring(7, 12); // Digits 8-12 (Index 7-11)

    // 4. Convert Weight (Grams -> Kg)
    // Example: 01250 -> 1.250 Kg
    const weightInGrams = parseInt(weightStr, 10);
    const weightInKg = weightInGrams / 1000;

    return {
        isWeighted: true,
        scalePlu: plu,
        weight: weightInKg,
        originalCode: code
    };
}

/**
 * Generates a Weight-Embedded Barcode
 * Format: 21 PPPPP WWWWW C
 */
export function generateWeightedBarcode(plu: string, weightInKg: number): string {
    // 1. Format Prefix
    const prefix = "21";

    // 2. Format PLU (5 digits, left-padded with 0)
    // "502" -> "00502"
    const formattedPlu = plu.padStart(5, '0').substring(0, 5);

    // 3. Format Weight (5 digits in grams)
    // 1.25 -> 1250 -> "01250"
    const weightInGrams = Math.round(weightInKg * 1000);
    const formattedWeight = weightInGrams.toString().padStart(5, '0').substring(0, 5);

    // 4. Construct payload (first 12 digits)
    const payload = `${prefix}${formattedPlu}${formattedWeight}`;

    // 5. Calculate Checksum (EAN-13 Mod 10)
    const checksum = calculateEan13Checksum(payload);

    return `${payload}${checksum}`;
}

function calculateEan13Checksum(digits: string): number {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(digits[i], 10);
        // Odd positions (0-indexed even i) * 1
        // Even positions (0-indexed odd i) * 3
        const weight = (i % 2 === 0) ? 1 : 3;
        sum += digit * weight;
    }
    const remainder = sum % 10;
    return (10 - remainder) % 10;
}
