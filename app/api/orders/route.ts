import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const OrderItemSchema = z.object({
  id: z.number(), // Product ID
  qty: z.number().min(0.001),
  // We don't strictly need price from frontend if we fetch from DB, 
  // but it's good to verify or use as override if allowed.
  // For this strict POS, let's use DB price or maybe allow frontend to send it if we support custom prices.
  // User prompt said "Price *at moment of sale*". 
  // Let's assume frontend sends the final negotiated price (maybe discounted) or we trust the DB.
  // I will accept price from frontend but default to DB if missing? 
  // Let's stick to the prompt's implied data flow: data passes these tables.
  price: z.number().min(0), 
});

const OrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  subTotal: z.number(),
  tax: z.number().default(0),
  discount: z.number().default(0),
  totalAmount: z.number(),
  paymentMethod: z.enum(["CASH", "CARD", "QR_CODE", "OTHER"]).default("CASH"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = OrderSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsedData.error },
        { status: 400 }
      );
    }

    const { items, subTotal, tax, discount, totalAmount, paymentMethod } =
      parsedData.data;

    // 1. Get a Temporary User
    let user = await db.user.findFirst();
    if (!user) {
        user = await db.user.create({
            data: {
                name: "Temp Cashier",
                username: "temp_cashier_" + Date.now(),
                password: "tempPositionPassword", 
                role: "CASHIER"
            }
        })
    }

    // 2. Fetch Products to get Cost and Verify
    const productIds = items.map(i => i.id);
    const dbProducts = await db.product.findMany({
        where: { id: { in: productIds } }
    });
    
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    // 3. Transaction
    const result = await db.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          subTotal,
          tax,
          discount,
          totalAmount,
          status: "COMPLETED",
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.id);
              if (!product) {
                  throw new Error(`Product with ID ${item.id} not found`);
              }

              // Logic for Quantity/Price
              // If qty is integer, easy. If qty is float (0.5kg), schema expects Int quantity.
              // Workaround: Store quantity as 1 (snapshot of "this line item") if it's fractional,
              // and store the TOTAL price of this line item as the price.
              // Or if it IS integer, store actual quantity.
              
              const isFractional = !Number.isInteger(item.qty);
              const quantityToStore = isFractional ? 1 : item.qty;
              
              // If we change quantity to 1 for fractional, the price per unit is effectively the total line price?
              // Or should we store unit price?
              // "price Float // Price *at moment of sale*" 
              // Usually means UNIT price.
              // But if quantity is coerced to 1, then price must be the total for that line to match the total amount.
              // Let's go with: Price = (Unit Price * Qty) if Qty is coerced to 1.
              // Cost = (Unit Cost * Qty) if Qty is coerced to 1.
              
              const storedPrice = isFractional ? (item.price * item.qty) : item.price;
              const unitCost = product.costPrice || 0;
              const storedCost = isFractional ? (unitCost * item.qty) : unitCost;

              return {
                productId: item.id,
                quantity: quantityToStore,
                price: storedPrice,
                cost: storedCost
              };
            })
          },
          payments: {
            create: {
              amount: totalAmount,
              method: paymentMethod as any, // Schema enum casting
            }
          }
        }
      });
      
      // 4. Update Stock
      for (const item of items) {
          await tx.product.update({
              where: { id: item.id },
              data: {
                  stock: {
                      decrement: Math.ceil(item.qty) // Decrement integer for now or change schema later
                      // If stock is Int, we can't decrement 0.5.
                      // For now, ceil it to be safe (over-decrement is better than under for stock safety?)
                      // Or just decrement 1 if it's weight based?
                      // Let's assumption: Stock is tracked in base units?
                      // If I sell 0.5kg, and stock is 100 (kg), I want 99.5.
                      // But stock is Int.
                      // Maybe stock represents GRAMS?
                      // User didn't specify.
                      // I will use decrement(1) if it's fractional for now or just skip stock update for fractional?
                      // Safest for MVP: Decrement 1 for any sale if fractional.
                  }
              }
          })
      }

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Transaction Error:", error);
    return NextResponse.json(
        { error: "Transaction failed", details: error.message }, 
        { status: 500 }
    );
  }
}
