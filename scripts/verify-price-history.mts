
import { POST } from "../app/api/products/add/route";
import { PUT } from "../app/api/products/[productId]/route";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

async function verify() {
    console.log("Starting verification...");

    const testBarcode = "TEST-HISTORY-123";
    
    // Cleanup
    await db.productPriceHistory.deleteMany({
        where: { product: { barcode: testBarcode } }
    });
    await db.product.deleteMany({
        where: { barcode: testBarcode }
    });

    console.log("Cleanup done.");

    // 1. Create Product
    const createPayload = {
        name: "Test Product History",
        barcode: testBarcode,
        description: "Test Description",
        price: 100,
        costPrice: 50,
        stock: 10,
        categoryId: null, // nullable
        unit: "pcs"
    };

    const createReq = new Request("http://localhost/api/products/add", {
        method: "POST",
        body: JSON.stringify(createPayload)
    });

    console.log("Creating product...");
    const createRes = await POST(createReq);
    
    if (createRes.status !== 201) {
        console.error("Failed to create product", createRes.status);
        process.exit(1);
    }

    const { product } = await createRes.json();
    console.log("Product created:", product.id);

    // Verify initial history
    const history1 = await db.productPriceHistory.findMany({
        where: { productId: product.id }
    });

    if (history1.length !== 1) {
        console.error("Expected 1 history record, found", history1.length);
        process.exit(1);
    }
    if (history1[0].validTo !== null) {
        console.error("Initial history should be active (validTo: null)");
        process.exit(1);
    }
    console.log("Initial history verified.");

    // 2. Update Product (Change Price)
    const updatePayload = {
        ...createPayload,
        price: 150, // Changed from 100
        description: "Updated Description"
    };

    const updateReq = new Request(`http://localhost/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify(updatePayload)
    });

    // Mock params
    const params = { params: Promise.resolve({ productId: product.id.toString() }) };

    console.log("Updating product...");
    const updateRes = await PUT(updateReq, params);

    if (updateRes.status !== 200 && updateRes.status !== 201) { // 200 usually, but can check
         // PUT returns json(result) which defaults to 200
    }

    // Verify history update
    const history2 = await db.productPriceHistory.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: 'asc' }
    });

    console.log("History records check:", history2.length);

    if (history2.length !== 2) {
        console.error("Expected 2 history records, found", history2.length);
        console.log(history2);
        process.exit(1);
    }

    const [oldRecord, newRecord] = history2;

    if (oldRecord.validTo === null) {
        console.error("Old record should be closed", oldRecord);
        process.exit(1);
    }

    // Check approx time? No, just not null.

    if (newRecord.validTo !== null) {
        console.error("New record should be active", newRecord);
        process.exit(1);
    }

    if (newRecord.price !== 150) {
        console.error("New record price should be 150", newRecord.price);
        process.exit(1);
    }

    console.log("Verification SUCCESS!");
    
    // Cleanup again? Maybe leave it for inspection if needed, but clean is better.
    await db.productPriceHistory.deleteMany({ where: { productId: product.id } });
    await db.product.delete({ where: { id: product.id } });
    console.log("Cleanup finished.");
}

verify().catch(e => {
    console.error(e);
    process.exit(1);
});
