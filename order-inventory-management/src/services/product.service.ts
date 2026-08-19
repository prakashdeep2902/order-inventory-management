import { prisma } from "../lib/prisma";

export const createProduct = async (
  name: string,
  price: number,
  stock: number,
) => {
  return prisma.product.create({
    data: {
      name,
      price,
      stock,
    },
  });
};

export const getActiveProducts = async () => {
  return prisma.product.findMany({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateProduct = async (
  productId: number,
  data: {
    name?: string;
    price?: number;
    active?: boolean;
  },
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data,
  });
};

export const updateStock = async (productId: number, stock: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      stock,
    },
  });
};
