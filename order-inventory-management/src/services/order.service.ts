import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createRequestHash } from "../utils/hash";

interface OrderItemInput {
  productId: number;
  quantity: number;
}

export const createOrder = async (
  userId: number,
  idempotencyKey: string,
  items: OrderItemInput[],
) => {
  const requestHash = createRequestHash({
    items,
  });

  return prisma.$transaction(
    async (tx) => {
      // 1. Check existing idempotency key
      const existingOrder = await tx.order.findUnique({
        where: {
          userId_idempotencyKey: {
            userId,
            idempotencyKey,
          },
        },
        include: {
          items: true,
        },
      });

      if (existingOrder) {
        if (existingOrder.requestHash !== requestHash) {
          throw new Error("IDEMPOTENCY_CONFLICT");
        }

        return {
          type: "EXISTING_ORDER",
          order: existingOrder,
        };
      }

      // 2. Validate duplicate products
      const productIds = items.map((item) => item.productId);

      if (new Set(productIds).size !== productIds.length) {
        throw new Error("DUPLICATE_PRODUCT");
      }

      // 3. Lock products in a consistent order
      const sortedProductIds = [...productIds].sort((a, b) => a - b);

      const products: {
        id: number;
        name: string;
        price: Prisma.Decimal;
        stock: number;
        active: boolean;
      }[] = [];

      for (const productId of sortedProductIds) {
        const result = await tx.$queryRaw<
          {
            id: number;
            name: string;
            price: Prisma.Decimal;
            stock: number;
            active: boolean;
          }[]
        >`
          SELECT id, name, price, stock, active
          FROM "Product"
          WHERE id = ${productId}
          FOR UPDATE
        `;

        if (result.length === 0) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        products.push(result[0]);
      }

      // 4. Validate quantities
      for (const item of items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new Error("INVALID_QUANTITY");
        }
      }

      // 5. Validate products and stock
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (!product.active) {
          throw new Error("PRODUCT_INACTIVE");
        }

        if (product.stock < item.quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      // 6. Calculate total
      let totalPrice = new Prisma.Decimal(0);

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;

        totalPrice = totalPrice.add(product.price.mul(item.quantity));
      }

      // 7. Deduct stock
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;

        await tx.product.update({
          where: {
            id: product.id,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 8. Create order
      const order = await tx.order.create({
        data: {
          userId,
          idempotencyKey,
          requestHash,
          totalPrice,

          items: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;

              return {
                productId: product.id,
                quantity: item.quantity,
                unitPrice: product.price,
              };
            }),
          },
        },

        include: {
          items: true,
        },
      });

      return {
        type: "NEW_ORDER",
        order,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );
};
