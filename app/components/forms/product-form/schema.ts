import * as z from "zod";

export const formSchema = z.object({
  name: z.string().min(1, {
    message: "Product name is required",
  }),
  barcode: z.string().optional(),
  scalePlu: z.string().optional(),
  isWeighed: z.boolean().default(false),
  description: z.string().optional(),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number",
  }),
  costPrice: z.coerce.number().min(0, {
    message: "Cost price must be a positive number",
  }),
  stock: z.coerce.number().int().min(0, {
    message: "Stock must be a positive integer",
  }),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof formSchema>;
