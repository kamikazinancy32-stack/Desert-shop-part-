import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { ToastComponent } from './components/toast/toast.component';
import { CartService } from './services/cart.service';
import { ToastService } from './services/toast.service';

/** The browser tab title when the cart is empty (same as index.html). */
export const BASE_TITLE = 'Dessert Shop | Product List with Cart';

/**
 * The parent component. The products and cart now live in services,
 * so this component only opens and closes the order confirmation modal,
 * and keeps the browser tab title in step with the cart count.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ProductListComponent,
    CartComponent,
    OrderConfirmationComponent,
    ToastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  isOrderConfirmed = false;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    title: Title,
  ) {
    // The tab title is outside any template, so the async pipe can't be used
    // here and a manual subscribe() is needed. takeUntilDestroyed() ends the
    // subscription automatically when this component is destroyed.
    this.cartService.totalQuantity$
      .pipe(takeUntilDestroyed())
      .subscribe((count) => title.setTitle(count > 0 ? `(${count}) ${BASE_TITLE}` : BASE_TITLE));
  }

  /** Opens the modal and hides any "added to cart" message. */
  confirmOrder(): void {
    this.toastService.hide();
    this.isOrderConfirmed = true;
  }

  /** Closes the modal and empties the cart. */
  startNewOrder(): void {
    this.cartService.clear();
    this.isOrderConfirmed = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
