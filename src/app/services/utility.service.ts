import { Injectable } from '@angular/core';
import { CartItem } from '../models/product.model';

/**
 * UtilityService: shared calculations used in more than one place
 * (CartService, the cart, and the order confirmation).
 */
@Injectable({ providedIn: 'root' })
export class UtilityService {
  /** Price of one cart row: unit price × quantity. */
  lineTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  /** Number of items in total, e.g. 2 waffles + 1 macaron = 3. */
  totalQuantity(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /** The order total: all line totals added up. */
  totalPrice(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + this.lineTotal(item), 0);
  }
}
