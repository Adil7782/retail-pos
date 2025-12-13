
// "type": "module" in package.json implies .js files are ESM.
// Node 18+ has global fetch.

async function testOrder() {
    console.log("Testing Order API...");

    const payload = {
        items: [
            { id: 1, qty: 2, price: 50 },
        ],
        subTotal: 100,
        tax: 0,
        discount: 0,
        totalAmount: 100,
        paymentMethod: "CASH"
    };

    try {
        const res = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", JSON.stringify(data, null, 2));

        if (res.ok) {
            console.log("✅ Success! Order created.");
        } else {
            console.log("❌ Failed.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testOrder();
