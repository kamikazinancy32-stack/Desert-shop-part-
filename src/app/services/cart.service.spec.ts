import { TestBed } from '@angular/core/testing';
import { CartItem, CartSummary } from '../models/product.model';
import { BROWNIE, CAKE, WAFFLE } from '../testing/test-data';
import { CartService } from './cart.service';
import { LoggerService } from './logger.service';

describe('CartService', () => {
  let service: CartService;
  let logger: jasmine.SpyObj<LoggerService>;

  /** Subscribes and keeps the latest value, like the async pipe would. */
  function latest<T>(source: { subscribe(fn: (v: T) => void): unknown }): () => T {
    let value!: T;
    source.subscribe((v) => (value = v));
    return () => value;
  }

  beforeEach(() => {
    logger = jasmine.createSpyObj<LoggerService>('LoggerService', ['log', 'error']);
    TestBed.configureTestingModule({ providers: [{ provide: LoggerService, useValue: logger }] });
    service = TestBed.inject(CartService);
  });

  it('starts with an empty cart that is emitted straight away (BehaviorSubject)', () => {
    const summary = latest<CartSummary>(service.summary$);
    expect(summary()).toEqual({ items: [], totalQuantity: 0, totalPrice: 0 });
  });

  it('adds a new dessert with quantity 1 and updates the summary immediately', () => {
    const summary = latest<CartSummary>(service.summary$);
    service.add(WAFFLE);
    expect(summary().items).toEqual([{ product: WAFFLE, quantity: 1 }]);
    expect(summary().totalQuantity).toBe(1);
    expect(summary().totalPrice).toBe(6.5);
  });

  it('increases the quantity instead of adding a duplicate row', () => {
    const items = latest<CartItem[]>(service.items$);
    service.add(WAFFLE);
    service.add(WAFFLE);
    expect(items().length).toBe(1);
    expect(items()[0].quantity).toBe(2);
  });

  it('decreases a quantity and removes the row when it reaches 0', () => {
    const items = latest<CartItem[]>(service.items$);
    service.add(WAFFLE);
    service.add(WAFFLE);
    service.decrease(WAFFLE);
    expect(items()[0].quantity).toBe(1);
    service.decrease(WAFFLE);
    expect(items()).toEqual([]);
  });

  it('removes one dessert completely and keeps the others', () => {
    const items = latest<CartItem[]>(service.items$);
    service.add(WAFFLE);
    service.add(WAFFLE);
    service.add(BROWNIE);
    service.remove(WAFFLE);
    expect(items()).toEqual([{ product: BROWNIE, quantity: 1 }]);
  });

  it('clears the cart', () => {
    const summary = latest<CartSummary>(service.summary$);
    service.add(WAFFLE);
    service.add(BROWNIE);
    service.clear();
    expect(summary()).toEqual({ items: [], totalQuantity: 0, totalPrice: 0 });
  });

  it('keeps count and total in sync across several changes', () => {
    const summary = latest<CartSummary>(service.summary$);
    service.add(WAFFLE); // 6.50
    service.add(WAFFLE); // 13.00
    service.add(BROWNIE); // 17.50
    service.add(CAKE); // 22.00
    service.decrease(WAFFLE); // 15.50
    expect(summary().totalQuantity).toBe(3);
    expect(summary().totalPrice).toBeCloseTo(15.5, 2);
  });

  it('logs an error and emits nothing when removing a dessert that is not in the cart', () => {
    const emitted: CartItem[][] = [];
    service.items$.subscribe((items) => emitted.push(items));
    service.decrease(WAFFLE);
    service.remove(WAFFLE);
    expect(emitted.length).toBe(1); // only the initial empty cart
    expect(logger.error).toHaveBeenCalledTimes(2);
  });

  it('never changes an array it has already emitted (new array per change)', () => {
    const emitted: CartItem[][] = [];
    service.items$.subscribe((items) => emitted.push(items));
    service.add(WAFFLE);
    service.add(WAFFLE);
    expect(emitted[1]).toEqual([{ product: WAFFLE, quantity: 1 }]);
    expect(emitted[2]).toEqual([{ product: WAFFLE, quantity: 2 }]);
    expect(emitted[1]).not.toBe(emitted[2]);
  });

  it('quantityOf$ emits only when that dessert’s quantity changes', () => {
    const quantities: number[] = [];
    service.quantityOf$(WAFFLE).subscribe((q) => quantities.push(q));
    service.add(WAFFLE);
    service.add(BROWNIE); // waffle unchanged → no emission (distinctUntilChanged)
    service.add(WAFFLE);
    service.clear();
    expect(quantities).toEqual([0, 1, 2, 0]);
  });

  it('totalQuantity$ skips emissions when the count does not change', () => {
    const counts: number[] = [];
    service.totalQuantity$.subscribe((c) => counts.push(c));
    service.add(WAFFLE);
    service.clear();
    service.clear(); // still 0 → no new emission
    expect(counts).toEqual([0, 1, 0]);
  });

  it('quantityOf gives a one-off snapshot', () => {
    service.add(BROWNIE);
    expect(service.quantityOf(BROWNIE)).toBe(1);
    expect(service.quantityOf(WAFFLE)).toBe(0);
  });
});
