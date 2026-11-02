import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css',
})
export class OrderConfirmationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() items: CartItem[] = [];
  @Input() totalPrice = 0;

  @Output() startNew = new EventEmitter<void>();

  @ViewChild('startButton') startButton?: ElementRef<HTMLButtonElement>;

  /** Runs once when the modal appears: stop the page behind it from scrolling. */
  ngOnInit(): void {
    document.body.classList.add('modal-open');
  }

  /** Runs after the modal's HTML exists: move keyboard focus into it. */
  ngAfterViewInit(): void {
    this.startButton?.nativeElement.focus();
  }

  /** Runs when the modal is removed: let the page scroll again. */
  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
  }

  trackByName(_index: number, item: CartItem): string {
    return item.product.name;
  }
}
