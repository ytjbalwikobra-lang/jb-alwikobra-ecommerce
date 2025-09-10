/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export type AnyProduct = Record<string, any>;
export type AnySale = Record<string, any>;

// Apply flash sale data onto a product consistently
export function applyFlashSaleToProduct(prod: AnyProduct, sale: AnySale): AnyProduct {
  if (!prod) return prod;
  const price = sale.sale_price ?? sale.salePrice ?? prod.price;
  const original = sale.original_price ?? sale.originalPrice ?? prod.original_price ?? prod.originalPrice ?? prod.price;
  const end = sale.end_time ?? sale.endTime;

  return {
    ...prod,
    isFlashSale: true,
    flashSaleEndTime: end,
    price,
    originalPrice: original,
  };
}
