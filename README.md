# Dessert Shop

An Angular app for ordering desserts. You browse a menu of nine desserts, add them to a cart, change quantities, and confirm the order in a summary modal.

I built it for the AmaliTech apprenticeship in two stages:

1. **FEM09 – Angular Fundamentals:** components, templates, data binding, directives and lifecycle hooks.
2. **FEM11 – Services & Dependency Injection:** moved the cart and product logic out of the components and into services.

The design comes from the Frontend Mentor challenge **Product list with cart**.

**Live site:** https://kamikazinancy32-stack.github.io/Desert-shop-part-/

---

## Contents

- [Features](#features)
- [Tech stack and why I chose it](#tech-stack-and-why-i-chose-it)
- [How it works](#how-it-works)
- [Services and dependency injection](#services-and-dependency-injection)
- [Angular concepts used](#angular-concepts-used)
- [Design decisions](#design-decisions)
- [Accessibility](#accessibility)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Deployment](#deployment)
- [Limitations and next steps](#limitations-and-next-steps)

---

## Features

- A grid of 9 desserts, with different image sizes for mobile, tablet and desktop
- An **Add to Cart** button that turns into a − / + quantity stepper once the item is in the cart
- A red border on desserts that are in the cart
- A cart showing each item's quantity, unit price, line total and the order total
- A button to remove one dessert from the cart completely
- An illustration when the cart is empty
- An order confirmation modal, with **Start New Order** to reset everything
- A short "added to cart" message (toast) that disappears after 2 seconds
- Prices formatted as US dollars with Angular's `currency` pipe
- Keyboard and screen-reader support (see [Accessibility](#accessibility))

---

## Tech stack and why I chose it

| Technology | Why I used it |
|---|---|
| **Angular (standalone components)** | It's the framework the apprenticeship teaches. Angular comes with components, dependency injection, pipes and a build tool built in, so I didn't need extra libraries. |
| **Standalone components** (no NgModules) | Each component lists exactly what it imports, so you can see a component's dependencies in one file. This is the current recommended way to write Angular. |
| **TypeScript** | Interfaces like `Product` and `CartItem` catch mistakes at compile time, for example a misspelt property or passing the wrong object to the cart. |
| **Angular services + constructor injection** | They keep shared state (the cart) and shared logic (totals, logging) in one place instead of copying it across components. Each component lists the services it needs in its constructor, so you can see its dependencies at a glance. |
| **Plain CSS with custom properties** | The app is small, so a CSS framework would add more weight than value. The style guide colours are CSS variables (`--red`, `--rose-900`, …) in `styles.css`, so every component uses the same palette. |
| **BEM class names** (`card__image--selected`) | Class names show which block and element they style, which stops styles from clashing even outside Angular's component style encapsulation. |
| **Self-hosted variable font (Red Hat Text)** | One font file covers every weight from 400 to 700. It's preloaded in `index.html` and uses `font-display: swap`, so text shows straight away instead of waiting for the font. The `@font-face` rule sits in `index.html` with a relative path, so it still works when the site is served from a sub-folder. |
| **`<picture>` with `srcset`** | Phones download the small image and desktops the large one, which saves data on mobile. |
| **GitHub Pages** | Free static hosting in the same place as the code, so the repository and the live site stay together. |

---

## How it works

### Starting the app

1. `main.ts` calls `bootstrapApplication(AppComponent, appConfig)`.
2. `app.config.ts` turns on zone change detection with `eventCoalescing: true`. When several events fire at once (like a click that bubbles), Angular checks the page once instead of once per event.
3. `AppComponent` renders the layout: the product list, the cart, the toast, and the order modal when an order has been confirmed.

### Adding a dessert to the cart

```
User clicks "Add to Cart"
        │
        ▼
ProductCardComponent.onAdd()
        │
        ├──► CartService.add(product)      → updates the shared cart array
        │         └──► LoggerService.log() → "[Logger #1] Added Waffle with Berries…"
        │
        └──► ToastService.show("… added to cart")  (only the first time)
        │
        ▼
Angular change detection runs
        │
        ├──► ProductCard reads cart.quantityOf() → shows the stepper + red border
        ├──► Cart reads cart.items / totalPrice  → new row and new total appear
        └──► Toast reads toast.message           → message pops up for 2 s
```

Components never pass the cart to each other. They all inject the **same** `CartService`, so when one component changes it, the others see the change.

### Confirming and resetting an order

1. `CartComponent` emits `(confirm)` when you click **Confirm Order**.
2. `AppComponent` hides the toast and sets `isOrderConfirmed = true`.
3. `*ngIf` creates `OrderConfirmationComponent`:
   - `ngOnInit` adds `modal-open` to `<body>` so the page behind the modal can't scroll, and logs the order.
   - `ngAfterViewInit` moves keyboard focus to **Start New Order**.
4. **Start New Order** emits `(startNew)`. `AppComponent` clears the cart, closes the modal and scrolls to the top.
5. `ngOnDestroy` removes `modal-open`, so the page can scroll again.

---

## Services and dependency injection

All logic that used to live in `AppComponent` is now in `src/app/services/`.

| Service | What it does | Used by |
|---|---|---|
| `CartService` | Owns the cart: add, decrease, remove, clear, quantity of one dessert, total items, order total | `ProductCard`, `Cart`, `OrderConfirmation`, `AppComponent` |
| `ProductService` | Returns the list of desserts | `ProductList` |
| `UtilityService` | Shared calculations: line total, total quantity, total price | `CartService`, `Cart`, `OrderConfirmation` |
| `LoggerService` | Writes actions and errors to the console, tagged with an instance number | `CartService`, `OrderConfirmation` |
| `ToastService` | Holds the toast message and clears it after 2 seconds | `ProductCard`, `Toast`, `AppComponent` |

### Why each service exists

- **`CartService`** is the one place that holds the cart's state. Before services, the cart lived in `AppComponent` and had to be passed down with `@Input()` and back up with `@Output()` through several layers. Now any component can inject it.
- **`ProductService`**: components ask it for products instead of importing `data/products.ts` directly. If the desserts later come from an API, only this file needs to change.
- **`UtilityService`**: the cart and the confirmation modal both need line totals and order totals. Keeping the maths in one place means the two can never show different numbers.
- **`LoggerService`** gives the app one consistent way to log. It also shows how provider scope works (see below).
- **`ToastService`**: the product card triggers the message, but a separate `ToastComponent` displays it. A service connects the two without making one a child of the other.

### Keeping the cart safe

- The cart array is `private`. Components read it through a getter (`items`) and can only change it by calling `add`, `decrease`, `remove` or `clear`.
- Every change creates a **new array** (using `map`, `filter` and spread) instead of editing the old one in place. This makes updates predictable and works well with Angular change detection.
- `totalQuantity` and `totalPrice` are **getters**, worked out from the items each time they're read rather than stored separately, so they can't get out of sync with the cart.
- `decrease` and `remove` check that the dessert is in the cart first, and log an error if it isn't.

### Provider scope: root vs. component

- **Root** (`@Injectable({ providedIn: 'root' })`): Angular makes **one** copy for the whole app (a singleton). All five services use this, which is why the cart is shared.
- **Component** (`providers: [LoggerService]` in `OrderConfirmationComponent`): that component gets its **own** copy, which is created when the modal opens and destroyed when it closes.

You can see this in the browser console. Cart actions log as `[Logger #1]` (the root copy). The modal logs as `#2`, then `#3` for the next order, and so on.

- **Module:** this app has no NgModules because it uses standalone components. App-wide providers would go in `app.config.ts`.

**When not to use a singleton:** use a component-level provider when each instance needs its own separate data. Examples are a form wizard used twice on one page (each needs its own step counter), or a modal that should start fresh every time it opens.

---

## Angular concepts used

| Concept | Where |
|---|---|
| Components | `ProductList`, `ProductCard`, `Cart`, `OrderConfirmation`, `Toast` |
| Interpolation `{{ }}` | Names, categories, prices, cart count |
| Property binding `[ ]` | `[src]`, `[alt]`, `[product]`, `[srcset]`, `[attr.aria-label]` |
| Event binding `( )` | `(click)`, `(confirm)`, `(startNew)` |
| `*ngFor` + `trackBy` | Product grid, cart items, order summary |
| `*ngIf` / `else` + `<ng-template>` | Add to Cart vs. stepper, empty vs. filled cart, the modal, no-products message |
| `ngClass` | Red border on desserts in the cart |
| `ngStyle` | Staggered fade-in delay on product cards |
| `@Input({ required: true })` | Passes each `product` into its card |
| `@Output()` + `EventEmitter` | `(confirm)` and `(startNew)` tell `AppComponent` to open or close the modal |
| `@ViewChild` | Gets the **Start New Order** button so it can receive focus |
| Lifecycle hooks | `ngOnInit` (load products, lock scrolling), `ngAfterViewInit` (move focus), `ngOnDestroy` (unlock scrolling) |
| Pipes | `currency: 'USD'` for every price |
| Dependency injection | Constructor injection in components and inside other services (`CartService` injects `UtilityService` and `LoggerService`) |

---

## Design decisions

- **The modal still uses `@Output()` instead of a service.** Whether the modal is open is a layout decision, and `AppComponent` owns the layout. Only the shared data (the cart) moved into a service. Events that just mean "tell my parent something happened" stayed as outputs.
- **`trackBy` on every list.** Without it, Angular rebuilds every `<li>` whenever a new cart array is created. With `trackByName`, it reuses the existing elements, so the page doesn't flicker and focus isn't lost.
- **The dessert name is used as the ID.** The challenge data has no `id` field and every name is unique, so the name identifies each item. With a real backend I would switch to a proper ID.
- **The toast only shows the first time you add a dessert.** Pressing + on the stepper doesn't show it again, so it doesn't keep popping up while you change quantities.
- **The toast is hidden when you confirm an order**, so it doesn't sit on top of the modal.
- **Staggered card animation (`ngStyle`)**: each card fades in 60 ms after the one before it. It's a small touch that makes the page load feel smoother.

---

## Accessibility

- Every icon-only button has an `aria-label`, for example "Remove one Waffle with Berries".
- The quantity stepper is a labelled `role="group"`, and its count is `aria-live`, so screen readers announce changes.
- The toast region is `role="status"` with `aria-live="polite"`.
- The modal uses `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` / `aria-describedby`. Focus moves into it when it opens.
- The page behind the modal can't scroll while the modal is open.
- Decorative images use `alt=""` so screen readers skip them. Product images use the dessert name as alt text.
- Visible focus styles make keyboard navigation easy to follow.
- The page uses proper landmarks and headings: `<main>`, `<section>`, `<aside>`, `<h1>`, `<h2>`.

---

## Project structure

```
src/
├── index.html                 # Page shell, meta tags, font preload
├── main.ts                    # Starts the app
├── styles.css                 # Global styles, font, colour variables
└── app/
    ├── app.component.*        # Layout + opens/closes the order modal
    ├── app.config.ts          # App-wide providers
    ├── components/
    │   ├── product-list/      # Gets desserts from ProductService, renders the grid
    │   ├── product-card/      # One dessert: image, Add to Cart / stepper
    │   ├── cart/              # Cart contents, total, Confirm Order
    │   ├── order-confirmation/# Summary modal (has its own LoggerService)
    │   └── toast/             # "Added to cart" message
    ├── services/              # Cart, Product, Utility, Logger, Toast
    ├── models/product.model.ts# Product, ProductImage, CartItem interfaces
    └── data/products.ts       # The 9 desserts
```

### Component tree

```
AppComponent                     → CartService, ToastService
├── ProductListComponent         → ProductService
│   └── ProductCardComponent     → CartService, ToastService
├── CartComponent                → CartService, UtilityService
├── OrderConfirmationComponent   → CartService, UtilityService, its own LoggerService
└── ToastComponent               → ToastService
```

---

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm start          # dev server at http://localhost:4200
npm run build      # production build in dist/dessert-shop/browser
```

Open the browser console while you use the app to see the `[Logger #n]` messages.

---

## Deployment

The app is live on **GitHub Pages**: https://kamikazinancy32-stack.github.io/Desert-shop-part-/

GitHub Pages serves the site from the `gh-pages` branch, at the `/Desert-shop-part-/` sub-path. To deploy a new version:

```bash
npx ng build --base-href /Desert-shop-part-/
# then publish the contents of dist/dessert-shop/browser to the gh-pages branch
```

`--base-href` tells Angular the app lives in a sub-folder, so the scripts, images and font load from the right place.

There's also a `netlify.toml` (build command `npm run build`, publish folder `dist/dessert-shop/browser`) if you want to deploy to Netlify instead.

---

## Limitations and next steps

- **The cart is only kept in memory**, so refreshing the page empties it. Saving it to `localStorage` inside `CartService` would fix this without changing any component.
- **There's no backend.** Products come from a local file. `ProductService` is the place to add an `HttpClient` call later.
- **Signals or RxJS:** the cart could be stored in an Angular `signal` or a `BehaviorSubject` so components react to changes directly instead of relying on getters.
- **Tests:** the services are plain classes with no UI, so they're easy to unit test. `CartService` and `UtilityService` would be the first to cover.
- **Focus trap:** focus moves into the modal, but you can still Tab out of it. Keeping focus inside would complete the dialog pattern.
