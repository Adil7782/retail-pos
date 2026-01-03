import { db } from "@/lib/db";
import ScaleSimulatorClient from "./ScaleSimulatorClient";

export const dynamic = "force-dynamic";

export default async function ScaleSimulatorPage() {
    // Fetch only products that are weighted and have a Scale PLU assigned
    const products = await db.product.findMany({
        where: {
            isWeighed: true,
            scalePlu: { not: null },
        },
        select: {
            id: true,
            name: true,
            scalePlu: true,
        },
        orderBy: {
            name: 'asc'
        }
    });

    return <ScaleSimulatorClient products={products} />;
}
