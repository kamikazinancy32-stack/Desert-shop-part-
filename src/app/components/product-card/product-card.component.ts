import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  /** The dessert to show. Comes from the parent (ProductListComponent). */
  @Input({ required: true }) product!: Product;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
  ) {}

  /** How many of this dessert are in the cart (0 = not in cart). */
  get quantity(): number {
    return this.cartService.quantityOf(this.product);
  }

  get inCart(): boolean {
    return this.quantity > 0;
  }

  onAdd(): void {
    const isNew = !this.inCart;
    this.cartService.add(this.product);
    // Only show the message the first time a dessert goes into the cart.
    if (isNew) {
      this.toastService.show(`${this.product.name} added to cart`);
    }
  }

  onDecrease(): void {
    this.cartService.decrease(this.product);
  }
}
