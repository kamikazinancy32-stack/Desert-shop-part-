import { Injectable } from '@angular/core';

/**
 * ToastService: holds the short "added to cart" message.
 * ProductCardComponent calls show(), ToastComponent displays the message,
 * and AppComponent calls hide() when an order is confirmed.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  message = '';

  private timer?: ReturnType<typeof setTimeout>;

  /** Shows a message, then clears it after 2 seconds. */
  show(message: string): void {
    clearTimeout(this.timer);
    this.message = message;
    this.timer = setTimeout(() => (this.message = ''), 2000);
  }

  /** Hides the message straight away. */
  hide(): void {
    clearTimeout(this.timer);
    this.message = '';
  }
}
