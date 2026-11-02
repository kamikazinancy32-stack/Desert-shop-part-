import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, Product } from './models/product.model';
import { PRODUCTS } from './data/products';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { ToastComponent } from './components/toast/toast.component';

/**
 * The parent component. It owns the shared data (products and cart)
 * and passes it down to the child components with @Input().
 * Children send user actions back up with @Output() events.
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
export class AppComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  cartItems: CartItem[] = [];
  isOrderConfirmed = false;
  toastMessage = '';

  private toastTimer?: ReturnType<typeof setTimeout>;

  /** Runs once when the app starts: load the desserts. */
  ngOnInit(): void {
    this.products = PRODUCTS;
  }

  /** Clean up the toast timer if the app is destroyed. */
  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  get totalQuantity(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  addToCart(product: Product): void {
    const existing = this.cartItems.find((i) => i.product.name === product.name);

    if (existing) {
      this.cartItems = this.cartItems.map((i) =>
        i.product.name === product.name ? { ...i, quantity: i.quantity + 1 } : i,
      );
    } else {
      this.cartItems = [...this.cartItems, { product, quantity: 1 }];
      this.showToast(`${product.name} added to cart`);
    }
  }

  decreaseQuantity(product: Product): void {
    this.cartItems = this.cartItems
      .map((i) => (i.product.name === product.name ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
  }

  removeFromCart(product: Product): void {
    this.cartItems = this.cartItems.filter((i) => i.product.name !== product.name);
  }

  confirmOrder(): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = '';
    this.isOrderConfirmed = true;
  }

  startNewOrder(): void {
    this.cartItems = [];
    this.isOrderConfirmed = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private showToast(message: string): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastTimer = setTimeout(() => (this.toastMessage = ''), 2000);
  }
}
