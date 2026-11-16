import { Injectable } from '@angular/core';

/**
 * LoggerService: writes app activity and errors to the browser console.
 *
 * providedIn: 'root' means Angular makes ONE shared LoggerService for the
 * whole app (a singleton). Each new copy gets its own number, so the console
 * shows which copy wrote each line. The shared root copy is #1.
 * OrderConfirmationComponent asks for its own copy in its `providers` array,
 * so it gets a new number (#2, #3, ...) every time the modal opens.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  /** Counts how many LoggerService copies have been created so far. */
  private static count = 0;

  /** The number of this copy (1, 2, 3, ...). */
  private id: number;

  constructor() {
    LoggerService.count++;
    this.id = LoggerService.count;
  }

  log(message: string): void {
    console.log(`[Logger #${this.id}] ${message}`);
  }

  error(message: string): void {
    console.error(`[Logger #${this.id}] ${message}`);
  }
}
