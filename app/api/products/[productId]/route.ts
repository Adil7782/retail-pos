import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: { productId: string } }
) {
    try {
        const body = await req.json();
        const { name, barcode, description, price, costPrice, stock, categoryId, unit } = body;
        const { productId } = await params;

        if (!productId) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const id = Number(productId);

        const result = await db.$transaction(async (tx) => {
            // 1. Fetch current product to check for price changes
            const currentProduct = await tx.product.findUnique({
                where: { id }
            });

            if (!currentProduct) {
                throw new Error("Product not found");
            }

            const priceChanged = currentProduct.price !== price;
            const costParamExists = costPrice !== undefined && costPrice !== null; // Optional update?
            // Assuming costPrice is always sent if we are doing a full update, but safer to check.
            // If the form sends all data, we compare.
            
            // Note: Floating point comparison might be tricky, but assuming direct equality for now.
            // Ideally we might want abs(a-b) < epsilon, but for now strict equality.

            const costChanged = costParamExists && currentProduct.costPrice !== costPrice;

            if (priceChanged || costChanged) {
                // Close the current active history
                await tx.productPriceHistory.updateMany({
                    where: {
                        productId: id,
                        validTo: null
                    },
                    data: {
                        validTo: new Date()
                    }
                });

                // Create new history record
                await tx.productPriceHistory.create({
                    data: {
                        productId: id,
                        price: price, // New price
                        costPrice: costPrice !== undefined ? costPrice : currentProduct.costPrice, // New or old cost
                    }
                });
            }

            // 2. Update the product
            const updatedProduct = await tx.product.update({
                where: { id },
                data: {
                    name,
                    barcode,
                    description,
                    price,
                    costPrice,
                    stock,
                    categoryId,
                    unit
                }
            });

            return updatedProduct;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("[PRODUCT_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
