import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, Product } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  @Input() items: CartItem[] = [];
  @Input() totalQuantity = 0;
  @Input() totalPrice = 0;

  @Output() remove = new EventEmitter<Product>();
  @Output() confirm = new EventEmitter<void>();

  trackByName(_index: number, item: CartItem): string {
    return item.product.name;
  }
}
