import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, Product } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Input() cartItems: CartItem[] = [];

  @Output() add = new EventEmitter<Product>();
  @Output() decrease = new EventEmitter<Product>();

  /** Looks up how many of a product are in the cart. */
  quantityOf(product: Product): number {
    const item = this.cartItems.find((i) => i.product.name === product.name);
    return item ? item.quantity : 0;
  }

  /** Helps *ngFor keep the same DOM element for each product. */
  trackByName(_index: number, product: Product): string {
    return product.name;
  }
}
