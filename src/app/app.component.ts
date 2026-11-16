import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { ToastComponent } from './components/toast/toast.component';
import { CartService } from './services/cart.service';
import { ToastService } from './services/toast.service';

/**
 * The parent component. The products and cart now live in services,
 * so this component only opens and closes the order confirmation modal.
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
  ) {}

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
