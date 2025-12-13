import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Expecting an array of objects: [{ name: "Groceries" }, { name: "Beverages" }, ...]
    const categories = await req.json();

    if (!Array.isArray(categories) || categories.some(cat => typeof cat.name !== "string")) {
      return new NextResponse("Invalid input", { status: 400 });
    }

    // SQLite does not support skipDuplicates in createMany, so we filter manually
    const categoryNames = categories.map((c: { name: string }) => c.name);
    const existingCategories = await db.category.findMany({
      where: {
        name: {
          in: categoryNames,
        },
      },
      select: {
        name: true,
      },
    });

    const existingNames = new Set(existingCategories.map((c) => c.name));
    const newCategories = categories.filter((c: { name: string }) => !existingNames.has(c.name));

    let count = 0;
    if (newCategories.length > 0) {
      const result = await db.category.createMany({
        data: newCategories,
      });
      count = result.count;
    }

    return NextResponse.json(
      { message: `${count} categories added, ${categories.length - count} skipped`,data:{name:categories[0].name} },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CATEGORY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
