import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { UtilityService } from '../../services/utility.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css',
  /**
   * Component-level provider: this component gets its OWN LoggerService
   * instead of the shared root one. A new copy is made each time the modal
   * opens and thrown away when it closes. In the console the cart logs as #1,
   * while this modal logs as #2, then #3 for the next order, and so on.
   */
  providers: [LoggerService],
})
export class OrderConfirmationComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Closing the modal is the parent's job, so this stays an @Output. */
  @Output() startNew = new EventEmitter<void>();

  @ViewChild('startButton') startButton?: ElementRef<HTMLButtonElement>;

  // cart and utils are public so the template can use them.
  constructor(
    public cart: CartService,
    public utils: UtilityService,
    private logger: LoggerService,
  ) {}

  /** Runs once when the modal appears: stop the page behind it from scrolling. */
  ngOnInit(): void {
    document.body.classList.add('modal-open');
    this.logger.log(`Order confirmed: ${this.cart.totalQuantity} items, total ${this.cart.totalPrice.toFixed(2)}`);
  }

  /** Runs after the modal's HTML exists: move keyboard focus into it. */
  ngAfterViewInit(): void {
    this.startButton?.nativeElement.focus();
  }

  /** Runs when the modal is removed: let the page scroll again. */
  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
    this.logger.log('Order confirmation closed');
  }

  trackByName(_index: number, item: CartItem): string {
    return item.product.name;
  }
}
