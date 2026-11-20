import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartService } from '../../services/cart.service';
import { LoggerService } from '../../services/logger.service';
import { ToastService } from '../../services/toast.service';
import { WAFFLE } from '../../testing/test-data';
import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;
  let cart: CartService;
  let toast: ToastService;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [
        { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['log', 'error']) },
      ],
    });
    fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', WAFFLE);
    cart = TestBed.inject(CartService);
    toast = TestBed.inject(ToastService);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  const addButton = () => el.querySelector<HTMLButtonElement>('.add-btn');
  const count = () => el.querySelector('.stepper__count')?.textContent?.trim();
  const stepperButtons = () => el.querySelectorAll<HTMLButtonElement>('.stepper__btn');

  it('shows Add to Cart when the dessert is not in the cart', () => {
    expect(addButton()).not.toBeNull();
    expect(el.querySelector('.card__image--selected')).toBeNull();
  });

  it('switches to the stepper and shows a toast the first time it is added', () => {
    spyOn(toast, 'show');
    addButton()!.click();
    fixture.detectChanges();

    expect(addButton()).toBeNull();
    expect(count()).toBe('1');
    expect(el.querySelector('.card__image--selected')).not.toBeNull();
    expect(toast.show).toHaveBeenCalledOnceWith('Waffle with Berries added to cart');
  });

  it('updates the count from the stepper buttons without showing the toast again', () => {
    addButton()!.click();
    fixture.detectChanges();
    spyOn(toast, 'show');

    stepperButtons()[1].click(); // +
    fixture.detectChanges();
    expect(count()).toBe('2');

    stepperButtons()[0].click(); // −
    stepperButtons()[0].click(); // − back to 0
    fixture.detectChanges();
    expect(addButton()).not.toBeNull();
    expect(toast.show).not.toHaveBeenCalled();
  });

  it('reacts to cart changes made somewhere else (e.g. the cart being cleared)', () => {
    cart.add(WAFFLE);
    fixture.detectChanges();
    expect(count()).toBe('1');

    cart.clear();
    fixture.detectChanges();
    expect(addButton()).not.toBeNull();
  });
});
