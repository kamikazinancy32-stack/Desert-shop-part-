import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { AppComponent, BASE_TITLE } from './app.component';
import { CartService } from './services/cart.service';
import { LoggerService } from './services/logger.service';
import { ProductService } from './services/product.service';
import { WAFFLE } from './testing/test-data';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let cart: CartService;
  let title: Title;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['log', 'error']) },
      ],
    });
    fixture = TestBed.createComponent(AppComponent);
    cart = TestBed.inject(CartService);
    title = TestBed.inject(Title);
    el = fixture.nativeElement;
    spyOn(window, 'scrollTo');
  });

  afterEach(() => document.body.classList.remove('modal-open'));

  it('keeps the tab title in sync with the cart count', () => {
    expect(title.getTitle()).toBe(BASE_TITLE);
    cart.add(WAFFLE);
    cart.add(WAFFLE);
    expect(title.getTitle()).toBe(`(2) ${BASE_TITLE}`);
    cart.clear();
    expect(title.getTitle()).toBe(BASE_TITLE);
  });

  it('stops updating the title after it is destroyed (takeUntilDestroyed)', () => {
    fixture.destroy();
    cart.add(WAFFLE);
    expect(title.getTitle()).toBe(BASE_TITLE);
  });

  it('adds from a product card, confirms the order, and starts a new order', fakeAsync(() => {
    fixture.detectChanges();
    tick(ProductService.SIMULATED_LATENCY_MS);
    fixture.detectChanges();

    // Add the first dessert from the grid → the cart updates in the same tick.
    el.querySelector<HTMLButtonElement>('.add-btn')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.cart__title')?.textContent).toContain('(1)');

    // Confirm → the modal shows the same cart.
    el.querySelector<HTMLButtonElement>('.cart .btn-primary')!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.summary__item').length).toBe(1);

    // Start new order → modal closes and the cart is empty again.
    el.querySelector<HTMLButtonElement>('.modal .btn-primary')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.modal')).toBeNull();
    expect(el.querySelector('.cart__title')?.textContent).toContain('(0)');

    tick(2000); // let the toast timer finish
  }));
});
