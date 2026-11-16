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
| `@Input()` / `@Output()` + `EventEmitter` | `ProductList` passes each `product` down to `ProductCard`; `Cart` emits `confirm` and `OrderConfirmation` emits `startNew` so `AppComponent` can open and close the modal |
| Lifecycle hooks | `ngOnInit` (load products, lock scroll), `ngAfterViewInit` (focus modal button), `ngOnDestroy` (clean up) |

## Services (FEM11)

The app logic and the shared cart now live in services in `src/app/services/`. Components get the services they need through constructor injection, for example `constructor(private cartService: CartService) {}`, instead of receiving cart data from `AppComponent` with `@Input()`/`@Output()`.

| Service | What it does | Used by |
|---|---|---|
| `CartService` | Holds the cart (shared state) in a private array with a public `items` getter: `add`, `decrease`, `remove`, `clear`, `quantityOf`, `totalQuantity`, `totalPrice` | `ProductCard`, `Cart`, `OrderConfirmation`, `AppComponent` |
| `ProductService` | `getProducts()` returns the desserts from `data/products.ts` | `ProductList` |
| `UtilityService` | Shared calculations: `lineTotal`, `totalQuantity`, `totalPrice` | `CartService`, `Cart`, `OrderConfirmation` |
| `LoggerService` | `log` and `error` messages in the console, labelled with the logger's number (`#1`, `#2`, ...) | `CartService`, `OrderConfirmation` |
| `ToastService` | Holds the "added to cart" message and clears it after 2 seconds | `ProductCard`, `Toast`, `AppComponent` |

`CartService` itself injects `UtilityService` and `LoggerService`, which shows that services can depend on other services.

### Root vs. component-level providers

- **Root** (`@Injectable({ providedIn: 'root' })`): Angular creates one shared copy (a singleton) for the whole app. All five services are provided this way. That is why adding a dessert in a product card updates the cart and the order summary straight away: they all read the same `CartService`.
- **Component** (`providers: [LoggerService]` in `OrderConfirmationComponent`): the component gets its own copy, created when the component appears and destroyed when it goes away. In the browser console, cart actions log as `[Logger #1]` (the root copy), while the order modal logs as `#2`, then `#3` for the next order, and so on.

### Discussion question

**What is the difference between providing a service in root versus in a component's providers array? Describe a scenario where you might not want a service to be a singleton.**

Providing a service in `root` gives the whole app one shared copy that lives as long as the app does. That suits data everyone must agree on, like the cart. Putting a service in a component's `providers` array gives that component (and its children) a private copy that is created and destroyed with the component. You would not want a singleton when each part of the screen needs its own separate data. For example, if a page shows two independent forms that each track their own step or unsaved input, sharing one service would mix their data. Giving each form its own copy keeps them apart and starts each one fresh.

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
