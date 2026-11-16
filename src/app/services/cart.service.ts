import { Injectable } from '@angular/core';
import { CartItem, Product } from '../models/product.model';
import { UtilityService } from './utility.service';
import { LoggerService } from './logger.service';

/**
 * CartService: owns the cart (the app's shared state).
 * Because it is providedIn: 'root', every component that injects it gets the
 * SAME cart, so a change made in a product card shows up in the cart and in
 * the order confirmation straight away.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  /** Private, so the cart can only be changed through the methods below. */
  private cartItems: CartItem[] = [];

  // A service can inject other services too.
  constructor(
    private utilityService: UtilityService,
    private logger: LoggerService,
  ) {}

  /** Components can read the cart items, but not replace the array. */
  get items(): CartItem[] {
    return this.cartItems;
  }

  /** Total number of items in the cart. */
  get totalQuantity(): number {
    return this.utilityService.totalQuantity(this.cartItems);
  }

  /** Total price of the cart. */
  get totalPrice(): number {
    return this.utilityService.totalPrice(this.cartItems);
  }

  /** How many of one dessert are in the cart (0 = not in the cart). */
  quantityOf(product: Product): number {
    const item = this.cartItems.find((i) => i.product.name === product.name);
    return item ? item.quantity : 0;
  }

  /** Adds one of a dessert. */
  add(product: Product): void {
    if (this.quantityOf(product) > 0) {
      this.cartItems = this.cartItems.map((i) =>
        i.product.name === product.name ? { ...i, quantity: i.quantity + 1 } : i,
      );
    } else {
      this.cartItems = [...this.cartItems, { product, quantity: 1 }];
    }
    this.logger.log(`Added ${product.name} (items in cart: ${this.totalQuantity})`);
  }

  /** Removes one of a dessert. The row disappears when it reaches 0. */
  decrease(product: Product): void {
    if (this.quantityOf(product) === 0) {
      this.logger.error(`Cannot remove ${product.name}: it is not in the cart`);
      return;
    }
    this.cartItems = this.cartItems
      .map((i) => (i.product.name === product.name ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    this.logger.log(`Removed one ${product.name} (items in cart: ${this.totalQuantity})`);
  }

  /** Removes a dessert from the cart completely. */
  remove(product: Product): void {
    if (this.quantityOf(product) === 0) {
      this.logger.error(`Cannot remove ${product.name}: it is not in the cart`);
      return;
    }
    this.cartItems = this.cartItems.filter((i) => i.product.name !== product.name);
    this.logger.log(`Removed ${product.name} from the cart`);
  }

  /** Empties the cart. */
  clear(): void {
    this.cartItems = [];
    this.logger.log('Cart cleared');
  }
}
