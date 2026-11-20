import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';
import { CartItem, CartSummary, Product } from '../models/product.model';
import { UtilityService } from './utility.service';
import { LoggerService } from './logger.service';

/**
 * CartService: owns the cart (the app's shared state).
 *
 * The cart lives in a BehaviorSubject. A BehaviorSubject always holds a
 * current value (it starts as an empty cart) and gives that value straight
 * away to anyone who subscribes, then pushes every new cart after that.
 * So when a product card adds an item, the cart, the cart count and the
 * order confirmation all receive the new cart at the same moment.
 *
 * Because the service is providedIn: 'root', every component shares ONE cart.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  /** Private, so the cart can only be changed through the methods below. */
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);

  /** Read-only stream of the cart items. asObservable() hides next(). */
  readonly items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  /**
   * Items + total count + total price in one object. All three come from the
   * SAME emission of items$, so they can never be out of sync with each other.
   */
  readonly summary$: Observable<CartSummary> = this.items$.pipe(
    map((items) => ({
      items,
      totalQuantity: this.utilityService.totalQuantity(items),
      totalPrice: this.utilityService.totalPrice(items),
    })),
  );

  /** Number of items in the cart. Only emits when the number actually changes. */
  readonly totalQuantity$: Observable<number> = this.items$.pipe(
    map((items) => this.utilityService.totalQuantity(items)),
    distinctUntilChanged(),
  );

  // A service can inject other services too.
  constructor(
    private utilityService: UtilityService,
    private logger: LoggerService,
  ) {}

  /** How many of one dessert are in the cart, as a stream (0 = not in the cart). */
  quantityOf$(product: Product): Observable<number> {
    return this.items$.pipe(
      map((items) => this.findQuantity(items, product)),
      distinctUntilChanged(),
    );
  }

  /** How many of one dessert are in the cart right now (a one-off snapshot). */
  quantityOf(product: Product): number {
    return this.findQuantity(this.itemsSubject.value, product);
  }

  /** Adds one of a dessert. */
  add(product: Product): void {
    const items = this.itemsSubject.value;
    const next =
      this.quantityOf(product) > 0
        ? items.map((i) =>
            i.product.name === product.name ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [...items, { product, quantity: 1 }];
    this.update(next, `Added ${product.name}`);
  }

  /** Removes one of a dessert. The row disappears when it reaches 0. */
  decrease(product: Product): void {
    if (!this.isInCart(product)) {
      return;
    }
    const next = this.itemsSubject.value
      .map((i) => (i.product.name === product.name ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    this.update(next, `Removed one ${product.name}`);
  }

  /** Removes a dessert from the cart completely. */
  remove(product: Product): void {
    if (!this.isInCart(product)) {
      return;
    }
    const next = this.itemsSubject.value.filter((i) => i.product.name !== product.name);
    this.update(next, `Removed ${product.name} from the cart`);
  }

  /** Empties the cart. */
  clear(): void {
    this.update([], 'Cart cleared');
  }

  /**
   * The only place that pushes a new cart. Every change builds a NEW array
   * (map / filter / spread), so subscribers always get a fresh value.
   */
  private update(items: CartItem[], message: string): void {
    this.itemsSubject.next(items);
    this.logger.log(`${message} (items in cart: ${this.utilityService.totalQuantity(items)})`);
  }

  private isInCart(product: Product): boolean {
    if (this.quantityOf(product) === 0) {
      this.logger.error(`Cannot remove ${product.name}: it is not in the cart`);
      return false;
    }
    return true;
  }

  private findQuantity(items: CartItem[], product: Product): number {
    return items.find((i) => i.product.name === product.name)?.quantity ?? 0;
  }
}
