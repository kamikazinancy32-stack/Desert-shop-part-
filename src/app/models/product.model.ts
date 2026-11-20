export interface ProductImage {
  thumbnail: string;
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface Product {
  name: string;
  category: string;
  price: number;
  image: ProductImage;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

/** Value of the category dropdown that means "don't filter by category". */
export const ALL_CATEGORIES = 'All';

/** What the user has typed / picked in the search bar above the grid. */
export interface ProductFilters {
  search: string;
  category: string;
}

/** Everything the cart UI needs, worked out from one list of cart items. */
export interface CartSummary {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}
