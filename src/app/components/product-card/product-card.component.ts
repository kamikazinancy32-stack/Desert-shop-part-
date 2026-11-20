import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
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
export class ProductCardComponent implements OnInit {
  /** The dessert to show. Comes from the parent (ProductListComponent). */
  @Input({ required: true }) product!: Product;

  /**
   * How many of this dessert are in the cart (0 = not in cart), as a stream.
   * The template reads it with the async pipe, which subscribes and
   * unsubscribes for us when the card is created / destroyed.
   */
  quantity$!: Observable<number>;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
  ) {}

  /** The @Input is only set by now, so this is where the stream can be made. */
  ngOnInit(): void {
    this.quantity$ = this.cartService.quantityOf$(this.product);
  }

  onAdd(): void {
    const isNew = this.cartService.quantityOf(this.product) === 0;
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
