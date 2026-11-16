import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-region" role="status" aria-live="polite">
      <p *ngIf="toastService.message" class="toast">
        <img src="assets/images/icon-order-confirmed.svg" alt="" width="20" height="20" />
        {{ toastService.message }}
      </p>
    </div>
  `,
  styles: [
    `
      .toast-region {
        position: fixed;
        left: 50%;
        bottom: 1.5rem;
        z-index: 20;
        transform: translateX(-50%);
        width: max-content;
        max-width: calc(100% - 2rem);
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border-radius: 999px;
        background-color: var(--rose-900);
        color: var(--white);
        font-size: 0.875rem;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(38, 15, 8, 0.25);
        animation: pop 0.25s ease;
      }

      @keyframes pop {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
      }
    `,
  ],
})
export class ToastComponent {
  // Public so the template can read the message.
  constructor(public toastService: ToastService) {}
}
