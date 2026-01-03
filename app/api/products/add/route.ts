import { NextResponse } from "next/server";


import { generateUniqueId } from "@/lib/generate-unique-id";
import { db } from "@/lib/db";


export async function POST(
    req: Request,
) {


    try {
        const body = await req.json();
        const { name, barcode, description, price, costPrice, stock, categoryId, unit, scalePlu, isWeighed } = body;

        console.log(name, barcode, description, price, costPrice, stock, categoryId, unit, scalePlu, isWeighed)
        let id = generateUniqueId();
        
        if (!name) {
             return new NextResponse("Name is required", { status: 400 });
        }

        // Validate Barcode uniqueness if provided
        if (barcode) {
            const existingBarcode = await db.product.findUnique({
                where: {
                    barcode: barcode
                }
            });

            if (existingBarcode) {
                return new NextResponse("Barcode already exists", { status: 409 });
            }
        }

        // Validate Scale PLU uniqueness if provided
        if (isWeighed && scalePlu) {
            const existingPlu = await db.product.findUnique({
                where: {
                    scalePlu: scalePlu
                }
            });

            if (existingPlu) {
                return new NextResponse("Scale PLU already exists", { status: 409 });
            }
        }
        
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

        return NextResponse.json({ product: newProduct, message: 'Product created successfully' }, { status: 201 });

    } catch (error) {
        console.error("[PRODUCT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}