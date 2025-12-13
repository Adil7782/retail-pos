import { NextResponse } from "next/server";


import { generateUniqueId } from "@/lib/generate-unique-id";
import { db } from "@/lib/db";


export async function POST(
    req: Request,
) {


    try {
        const { name, barcode, description, price, costPrice, stock, categoryId,unit } = await req.json();
        console.log(name, barcode, description, price, costPrice, stock, categoryId,unit)
        let id = generateUniqueId();
        
        if (!barcode || !name) {
  return new NextResponse("Barcode and name are required", { status: 400 });
}
        const existingBarcode = await db.product.findUnique({
            where: {
                barcode
            }
        });

        console.log(existingBarcode)
        const existingName = await db.product.findFirst({
            where: {
                name
            }
        });

        if (existingBarcode || existingName) {
            return new NextResponse("Product is already registered", { status: 409 })
        }

        const newProduct = await db.product.create({
            data: {
               name,
               barcode,
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