import { Product } from '../models/product.model';

/** Small, predictable products for tests (prices chosen to give exact totals). */
function makeProduct(name: string, category: string, price: number): Product {
  return {
    name,
    category,
    price,
    image: { thumbnail: '', mobile: '', tablet: '', desktop: '' },
  };
}

export const WAFFLE = makeProduct('Waffle with Berries', 'Waffle', 6.5);
export const BROWNIE = makeProduct('Salted Caramel Brownie', 'Brownie', 4.5);
export const CAKE = makeProduct('Red Velvet Cake', 'Cake', 4.5);
