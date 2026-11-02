# Dessert Shop App

An Angular app where you can browse desserts, add them to a cart, change quantities, and confirm an order. Built for the **Angular Fundamentals** lab of the AmaliTech apprenticeship, based on the Frontend Mentor "Product list with cart" design.

**Live site:** _add your Netlify/Vercel link here_

## Features

- Product grid of 9 desserts with responsive images (mobile, tablet, desktop)
- "Add to Cart" button that turns into a quantity stepper (− / +)
- Products in the cart are highlighted with a red border
- Cart that shows each item, its quantity, line total, and the order total
- Remove single items from the cart
- Empty cart state with illustration
- Order confirmation modal and "Start New Order" to reset
- Short message when an item is added to the cart
- Prices formatted with Angular's `currency` pipe
- Keyboard-friendly: visible focus, labelled buttons, focus moves into the modal

## Angular concepts used

| Concept | Where |
|---|---|
| Components | `ProductList`, `ProductCard`, `Cart`, `OrderConfirmation`, `Toast` |
| Interpolation `{{ }}` | names, categories, prices, cart count |
| Property binding `[ ]` | `[src]`, `[alt]`, `[product]`, `[quantity]`, `[items]` |
| Event binding `( )` | `(click)`, `(add)`, `(decrease)`, `(remove)`, `(confirm)` |
| `*ngFor` | product grid, cart items, order summary |
| `*ngIf` / `else` | Add to Cart vs stepper, empty vs filled cart, modal, no-products message |
| `ngClass` | red border on products in the cart |
| `ngStyle` | staggered fade-in delay on product cards |
| `@Input()` / `@Output()` + `EventEmitter` | data flows down from `AppComponent`, user actions flow back up |
| Lifecycle hooks | `ngOnInit` (load products, lock scroll), `ngAfterViewInit` (focus modal button), `ngOnDestroy` (clean up) |

## Component structure

```
AppComponent (owns products + cart state)
├── ProductListComponent
│   └── ProductCardComponent (× 9)
├── CartComponent
├── OrderConfirmationComponent (shown after Confirm Order)
└── ToastComponent
```

## Run locally

Requires Node.js 18+.

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/dessert-shop/browser
```

## Deployment

Deployed on Netlify. `netlify.toml` sets the build command and publish folder (`dist/dessert-shop/browser`).
