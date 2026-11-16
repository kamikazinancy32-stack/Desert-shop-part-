import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  /** Opening the modal is the parent's job, so this stays an @Output. */
  @Output() confirm = new EventEmitter<void>();

  // Public so the template can read the cart and use lineTotal().
  constructor(
    public cart: CartService,
    public utils: UtilityService,
  ) {}

  trackByName(_index: number, item: CartItem): string {
    return item.product.name;
  }
}
