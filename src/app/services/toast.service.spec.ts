import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let message: string;
  let sub: Subscription;
  const DURATION = ToastService.DURATION_MS;

  beforeEach(() => {
    service = TestBed.inject(ToastService);
    sub = service.message$.subscribe((m) => (message = m));
  });

  afterEach(() => sub.unsubscribe());

  it('starts with no message', () => {
    expect(message).toBe('');
  });

  it('shows a message and hides it after 2 seconds', fakeAsync(() => {
    service.show('Waffle added to cart');
    expect(message).toBe('Waffle added to cart');

    tick(DURATION - 1);
    expect(message).toBe('Waffle added to cart');

    tick(1);
    expect(message).toBe('');
  }));

  it('restarts the timer for a new message (switchMap cancels the old timer)', fakeAsync(() => {
    service.show('First');
    tick(1500);
    service.show('Second');

    tick(1000); // the first timer would have fired here
    expect(message).toBe('Second');

    tick(1000);
    expect(message).toBe('');
  }));

  it('hide() clears the message straight away and cancels the timer', fakeAsync(() => {
    service.show('First');
    service.hide();
    expect(message).toBe('');
    tick(DURATION);
    expect(message).toBe('');
  }));
});
