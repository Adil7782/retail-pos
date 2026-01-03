import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!Array.isArray(body)) {
            return new NextResponse("Invalid input: Expected an array of products", { status: 400 });
        }

        const stats = {
            total: body.length,
            created: 0,
            failed: 0,
            errors: [] as any[]
        };

        const results = [];

        for (const productData of body) {
            const { name, barcode, description, price, costPrice, stock, categoryId, unit, scalePlu, isWeighed } = productData;
            
            // Basic Validation
            if (!name) {
                stats.failed++;
                results.push({ status: 'failed', name, reason: "Name is required" });
                continue;
            }

            try {
                // Check unique constraints manually if needed, or let Prisma throw unique constraint errors.
                // Checking manually allows for better error messages in the batch response.

                // Validate Barcode uniqueness
                if (barcode) {
                    const existingBarcode = await db.product.findUnique({
                        where: { barcode: barcode }
                    });
                    if (existingBarcode) {
                        stats.failed++;
                        results.push({ status: 'failed', name, barcode, reason: `Barcode ${barcode} already exists` });
                        continue;
                    }
                }

                // Validate Scale PLU uniqueness
                if (isWeighed && scalePlu) {
                    const existingPlu = await db.product.findUnique({
                        where: { scalePlu: scalePlu }
                    });
                    if (existingPlu) {
                        stats.failed++;
                        results.push({ status: 'failed', name, scalePlu, reason: `Scale PLU ${scalePlu} already exists` });
                        continue;
                    }
                }

                // Create Product
                const newProduct = await db.product.create({
                    data: {
                        name,
                        barcode: barcode || null,
                        scalePlu: scalePlu || null,
                        isWeighed: isWeighed || false,
                        description,
                        price,
                        costPrice,
                        stock,
                        categoryId,
                        unit,
                        productPrices: {
                            create: {
                                price,
                                costPrice
                            }
                        }
                    }
                });

                stats.created++;
                results.push({ status: 'success', name, id: newProduct.id });

            } catch (innerError: any) {
                console.error(`Error creating product ${name}:`, innerError);
                stats.failed++;
                results.push({ status: 'failed', name, reason: innerError.message || "Database error" });
            }
        }

        return NextResponse.json({ 
            message: "Batch processing completed", 
            stats, 
            details: results 
        }, { status: 201 });

    } catch (error) {
        console.error("[BATCH_PRODUCT_IMPORT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
