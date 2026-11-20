import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CartItem, CartSummary } from '../../models/product.model';
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

  /** Items, count and total. Read in the template with the async pipe. */
  readonly summary$: Observable<CartSummary>;

  // cart is public so the template can call cart.remove(); utils for lineTotal().
  constructor(
    public cart: CartService,
    public utils: UtilityService,
  ) {
    this.summary$ = this.cart.summary$;
  }

  trackByName(_index: number, item: CartItem): string {
    return item.product.name;
  }
}
