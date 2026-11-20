import { Injectable } from '@angular/core';
import { Observable, Subject, map, of, startWith, switchMap, timer } from 'rxjs';

/**
 * ToastService: holds the short "added to cart" message.
 * ProductCardComponent calls show(), ToastComponent displays message$,
 * and AppComponent calls hide() when an order is confirmed.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  /** How long a message stays on screen, in milliseconds. */
  static readonly DURATION_MS = 2000;

  /**
   * A plain Subject, because show()/hide() are events with no "current value".
   * Private, so only this service can push into it.
   */
  private readonly requests = new Subject<string>();

  /**
   * The message to display ('' = nothing). For each request, switchMap starts a
   * fresh 2-second timer and CANCELS the previous one, so a new message is
   * never cut short by an older timer. This replaces setTimeout/clearTimeout.
   */
  readonly message$: Observable<string> = this.requests.pipe(
    switchMap((message) =>
      message
        ? timer(ToastService.DURATION_MS).pipe(
            map(() => ''),
            startWith(message),
          )
        : of(''),
    ),
    startWith(''),
  );

  /** Shows a message, then clears it after 2 seconds. */
  show(message: string): void {
    this.requests.next(message);
  }

  /** Hides the message straight away (and cancels its timer). */
  hide(): void {
    this.requests.next('');
  }
}
