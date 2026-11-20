import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartService } from '../../services/cart.service';
import { LoggerService } from '../../services/logger.service';
import { BROWNIE, WAFFLE } from '../../testing/test-data';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  let fixture: ComponentFixture<CartComponent>;
  let cart: CartService;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['log', 'error']) },
      ],
    });
    fixture = TestBed.createComponent(CartComponent);
    cart = TestBed.inject(CartService);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  const title = () => el.querySelector('.cart__title')?.textContent?.trim();
  const total = () => el.querySelector('.cart__total strong')?.textContent?.trim();
  const rows = () => el.querySelectorAll('.cart__item').length;

  it('shows the empty cart at first', () => {
    expect(title()).toBe('Your Cart (0)');
    expect(el.querySelector('.cart__empty')).not.toBeNull();
  });

  it('updates the rows, count and total as soon as the cart stream changes', () => {
    cart.add(WAFFLE);
    cart.add(WAFFLE);
    cart.add(BROWNIE);
    fixture.detectChanges();

    expect(title()).toBe('Your Cart (3)');
    expect(rows()).toBe(2);
    expect(total()).toBe('$17.50');
  });

  it('removes a row when its remove button is clicked', () => {
    cart.add(WAFFLE);
    cart.add(BROWNIE);
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.cart__remove')!.click();
    fixture.detectChanges();

    expect(rows()).toBe(1);
    expect(title()).toBe('Your Cart (1)');
    expect(total()).toBe('$4.50');
  });

  it('goes back to the empty state when the cart is cleared', () => {
    cart.add(WAFFLE);
    fixture.detectChanges();
    cart.clear();
    fixture.detectChanges();

    expect(title()).toBe('Your Cart (0)');
    expect(el.querySelector('.cart__empty')).not.toBeNull();
  });

  it('emits confirm when Confirm Order is clicked', () => {
    const spy = jasmine.createSpy('confirm');
    fixture.componentInstance.confirm.subscribe(spy);
    cart.add(WAFFLE);
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    expect(spy).toHaveBeenCalled();
  });
});
