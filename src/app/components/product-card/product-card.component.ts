import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

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

  /** How many of this dessert are in the cart (0 = not in cart). */
  @Input() quantity = 0;

  /** Tells the parent the user wants to add one. */
  @Output() add = new EventEmitter<Product>();

  /** Tells the parent the user wants to remove one. */
  @Output() decrease = new EventEmitter<Product>();

  get inCart(): boolean {
    return this.quantity > 0;
  }

  onAdd(): void {
    this.add.emit(this.product);
  }

  onDecrease(): void {
    this.decrease.emit(this.product);
  }
}
