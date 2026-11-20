# Dessert Shop

An Angular app for ordering desserts. You browse a menu of nine desserts, search and filter them, add them to a cart, change quantities, and confirm the order in a summary modal.

I built it for the AmaliTech apprenticeship in three stages:

1. **FEM09 – Angular Fundamentals:** components, templates, data binding, directives and lifecycle hooks.
2. **FEM11 – Services & Dependency Injection:** moved the cart and product logic out of the components and into services.
3. **FEM14 – RxJS & Observables:** the services now expose Observable streams, the cart lives in a `BehaviorSubject`, and the product grid has a reactive search and category filter. See [Reactive programming with RxJS (FEM14)](#reactive-programming-with-rxjs-fem14).

The design comes from the Frontend Mentor challenge **Product list with cart**.

**Live site:** https://kamikazinancy32-stack.github.io/Desert-shop-part-/

---

## Contents

- [Features](#features)
- [Tech stack and why I chose it](#tech-stack-and-why-i-chose-it)
- [How it works](#how-it-works)
- [Services and dependency injection](#services-and-dependency-injection)
- [Reactive programming with RxJS (FEM14)](#reactive-programming-with-rxjs-fem14)
- [Testing](#testing)
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
- A **search box** (by name) and a **category dropdown** that filter the grid as you type, with loading, "no match" and error messages
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
| **RxJS** (already part of Angular) | Data that changes over time (search text, the cart, the toast) is modelled as streams. Components subscribe with the `async` pipe and update by themselves when a new value arrives. No extra package was added: RxJS 7.8 ships with Angular. |
| **Reactive forms** (`FormControl`) | `searchControl.valueChanges` is already an Observable of what the user types, so the search needs no extra `Subject`. |
| **Jasmine + Karma** | The test tools that come with the Angular CLI. `fakeAsync` / `tick` let tests move time forward to check debounce, delays and timers without waiting. |
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
        ├──► CartService.add(product)  → builds a new array, itemsSubject.next(newItems)
        │         └──► LoggerService.log() → "[Logger #1] Added Waffle with Berries…"
        │
        └──► ToastService.show("… added to cart")  (only the first time)
        │
        ▼
The cart BehaviorSubject pushes the new cart to every subscriber at once
        │
        ├──► ProductCard  quantityOf$(product) | async → stepper + red border
        ├──► Cart         summary$ | async             → new row, count and total
        ├──► AppComponent totalQuantity$ (subscribe)   → tab title "(1) Dessert Shop…"
        └──► Toast        message$ | async             → message pops up for 2 s
```

Components never pass the cart to each other. They all inject the **same** `CartService` and subscribe to its streams, so when one component changes the cart, the others are **pushed** the new value. Nobody has to ask for it again.

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
| `CartService` | Owns the cart in a `BehaviorSubject`: add, decrease, remove, clear. Exposes `items$`, `summary$`, `totalQuantity$` and `quantityOf$()` | `ProductCard`, `Cart`, `OrderConfirmation`, `AppComponent` |
| `ProductService` | Exposes the desserts as Observables: `getProducts()`, `getCategories()`, `searchProducts()` | `ProductList` |
| `UtilityService` | Shared calculations: line total, total quantity, total price | `CartService`, `Cart`, `OrderConfirmation` |
| `LoggerService` | Writes actions and errors to the console, tagged with an instance number | `CartService`, `ProductService`, `ProductList`, `OrderConfirmation` |
| `ToastService` | Exposes `message$`, which shows a message and clears it after 2 seconds | `ProductCard`, `Toast`, `AppComponent` |

### Why each service exists

- **`CartService`** is the one place that holds the cart's state. Before services, the cart lived in `AppComponent` and had to be passed down with `@Input()` and back up with `@Output()` through several layers. Now any component can inject it.
- **`ProductService`**: components ask it for products instead of importing `data/products.ts` directly. If the desserts later come from an API, only this file needs to change.
- **`UtilityService`**: the cart and the confirmation modal both need line totals and order totals. Keeping the maths in one place means the two can never show different numbers.
- **`LoggerService`** gives the app one consistent way to log. It also shows how provider scope works (see below).
- **`ToastService`**: the product card triggers the message, but a separate `ToastComponent` displays it. A service connects the two without making one a child of the other.

### Keeping the cart safe

- The `BehaviorSubject` is `private`. Components get a read-only stream (`items$ = itemsSubject.asObservable()`), so they can't call `next()` themselves. The only way to change the cart is `add`, `decrease`, `remove` or `clear`.
- All four methods go through one private `update()` method, which is the **only** place that calls `next()`.
- Every change creates a **new array** (using `map`, `filter` and spread) instead of editing the old one in place, so an array that has already been emitted never changes afterwards.
- The count and total are **worked out from the items** (`summary$` maps each cart to `{ items, totalQuantity, totalPrice }`) rather than stored separately, so they can't get out of sync with the cart.
- `decrease` and `remove` check that the dessert is in the cart first. If it isn't, they log an error and emit nothing.

### Provider scope: root vs. component

- **Root** (`@Injectable({ providedIn: 'root' })`): Angular makes **one** copy for the whole app (a singleton). All five services use this, which is why the cart is shared.
- **Component** (`providers: [LoggerService]` in `OrderConfirmationComponent`): that component gets its **own** copy, which is created when the modal opens and destroyed when it closes.

You can see this in the browser console. Cart actions log as `[Logger #1]` (the root copy). The modal logs as `#2`, then `#3` for the next order, and so on.

- **Module:** this app has no NgModules because it uses standalone components. App-wide providers would go in `app.config.ts`.

**When not to use a singleton:** use a component-level provider when each instance needs its own separate data. Examples are a form wizard used twice on one page (each needs its own step counter), or a modal that should start fresh every time it opens.

---

## Reactive programming with RxJS (FEM14)

### What FEM14 changed

| Before (FEM11) | After (FEM14) |
|---|---|
| `ProductService.getProducts()` returned a plain array | It returns an `Observable<Product[]>` that emits after a short simulated delay |
| `ProductListComponent` copied the array into a field in `ngOnInit` | It builds one `state$` stream from the search box, the category dropdown and the product search, and the template reads it with `async` |
| No search or filtering | Search by name + filter by category, with debounce, loading, "no match" and error states |
| The cart was a private array with getters (`items`, `totalQuantity`, `totalPrice`) | The cart is a `BehaviorSubject<CartItem[]>`, exposed as `items$`, `summary$`, `totalQuantity$` and `quantityOf$()` |
| Components read getters and relied on change detection to re-read them | Components subscribe to streams with the `async` pipe and are pushed every change |
| `ToastService` used `setTimeout` / `clearTimeout` | `message$` uses `switchMap` + `timer`, which cancels the old timer automatically |
| No tests | 51 unit tests (services, components, debounce, `switchMap`, errors) |

### What "reactive" means in this app

Instead of a component **asking** for data ("what's in the cart right now?"), it **subscribes** to a stream and is **told** whenever the data changes. A stream (an Observable) is a value that can change over time:

- the text in the search box over time,
- the contents of the cart over time,
- the toast message over time.

The services own those streams and decide how they change. The components just say what to show for each value, and they use the `async` pipe so Angular handles subscribing and unsubscribing for them.

**Observer:** each `subscribe()` (or each `async` pipe) is an observer. It receives `next` values, and can also receive `error` and `complete`. For example, `getProducts()` emits **one** `next` (the desserts) and then `complete`, the same way an HTTP request would. The cart stream never completes, because the cart can always change again.

### Streams each service exposes

| Service | Stream | Kind | What it emits |
|---|---|---|---|
| `ProductService` | `getProducts()` | Cold Observable, emits once then completes | A **copy** of the 9 desserts, after a 250 ms simulated delay |
| `ProductService` | `getCategories()` | Cold Observable, emits once | `['All', 'Waffle', 'Crème Brûlée', …]`, no duplicates |
| `ProductService` | `searchProducts(filters)` | Cold Observable, emits once | The desserts that match the filters |
| `CartService` | `items$` | `BehaviorSubject` as read-only Observable | The current cart items, then every new cart |
| `CartService` | `summary$` | Derived from `items$` | `{ items, totalQuantity, totalPrice }` |
| `CartService` | `totalQuantity$` | Derived from `items$` | The item count, only when it changes |
| `CartService` | `quantityOf$(product)` | Derived from `items$` | How many of one dessert are in the cart, only when it changes |
| `ToastService` | `message$` | Built from a private `Subject` | The message, then `''` 2 seconds later |

**About the simulated delay:** there is no backend. The desserts are still the local file `data/products.ts`. `ProductService` wraps it in `of(...)` and adds `delay(250)` so the app behaves like it would with a real request: the data arrives *later*, there is a loading state, and slow responses can arrive out of order (which is what `switchMap` protects against). If a real API is added, `of(PRODUCTS).pipe(delay(...))` becomes `http.get<Product[]>(url)`, which also returns an Observable, so no component would need to change.

### Subjects used, and why

| Subject | Where | Why this kind |
|---|---|---|
| `BehaviorSubject<CartItem[]>` | `CartService.itemsSubject` | The cart always **has** a current value (it starts empty). A `BehaviorSubject` stores it and gives it **immediately** to every new subscriber. So the cart, a product card created later, or the order modal all see the current cart at once, not only future changes. It also lets the service read the current cart synchronously (`.value`) when building the next one. |
| `Subject<string>` | `ToastService.requests` | `show()` and `hide()` are **events**, not state. There is nothing to replay to a late subscriber, so a plain `Subject` is the right fit. `message$` adds the starting value `''` with `startWith`. |

Both subjects are `private`, and only Observables are exposed (`asObservable()` / a piped stream), so components can't push values into them. No other subjects were needed. The search box and dropdown already provide streams through `FormControl.valueChanges`.

### Operators and where they are used

| Operator | Where | Why |
|---|---|---|
| `of` | `ProductService.getProducts()`, `getCategories()`; fallback values in `catchError` | Turns the local data (or a fallback value) into an Observable |
| `delay` | `ProductService.getProducts()` | Simulates network time, so the data arrives asynchronously |
| `map` | Everywhere: copying the product list, filtering it, building `summary$`, trimming the search text, turning results into view state | Transforms each value into the shape the next step needs |
| `filter` | Search stream in `ProductListComponent` | Drops 1-letter searches (`"c"`), which would match almost everything. An empty box is still let through so clearing works. |
| `tap` | `ProductService.searchProducts()` | Logs how many desserts each search found. This is only a side effect (logging), with no business logic. |
| `debounceTime(300)` | Search stream | Waits until typing pauses for 300 ms, so typing "cake" runs **one** search instead of four |
| `distinctUntilChanged` | Search and category streams; `totalQuantity$`; `quantityOf$()` | Skips values that didn't really change. For example, `"cake"` → `"cake   "` (same after trimming) doesn't search again, and adding a brownie doesn't make the waffle card update |
| `startWith` | Search/category streams, loading state, `message$` | Gives a stream a first value right away: an empty search, "All", "loading", or no toast |
| `combineLatest` | `ProductListComponent`: search text + category | Emits the latest **pair** whenever **either** one changes. Both inputs are ongoing streams, which is why `forkJoin` (which waits for every source to *complete*) would be wrong here. |
| `switchMap` | `ProductListComponent`: filters → `searchProducts()`. `ToastService`: message → `timer` | Starts a new inner Observable for each value and **cancels the previous one**. An old, slow search can never overwrite a newer one, and an old toast timer can never hide a newer message. |
| `catchError` | Inside the search `switchMap`; on `getCategories()` | Turns an error into a normal value (an error state, or a fallback `['All']`) instead of breaking the stream |
| `scan` | `ProductListComponent.state$` | Merges each update into the previous view state, so the previous results stay visible (dimmed) while a new search loads instead of the grid flashing empty |
| `timer` | `ToastService.message$` | Emits once after 2 seconds to clear the toast. Replaces `setTimeout` |
| `take(1)` | `OrderConfirmationComponent.ngOnInit` | Reads the current cart once for the log message. The subscription completes by itself. |
| `takeUntilDestroyed` | `AppComponent` | Ends the tab title subscription when the component is destroyed |

### Search and filter flow

All in `ProductListComponent` (the filtering itself is in `ProductService`):

```
searchControl.valueChanges                       categoryControl.valueChanges
  │ debounceTime(300)  wait for typing to pause    │ startWith('All')
  │ map(trim)                                      │ distinctUntilChanged()
  │ filter(empty or 2+ letters)                    │
  │ startWith('')                                  │
  │ distinctUntilChanged()                         │
  └───────────────────────┬────────────────────────┘
                          ▼
        combineLatest → map to { search, category }
                          │
                          ▼
        switchMap(filters → productService.searchProducts(filters)
                          │      map(products → { products, loading: false })
                          │      catchError(→ of({ error: 'Sorry…' }))
                          │      startWith({ loading: true }) )
                          ▼
        scan(merge into previous state)   →   state$ | async   in the template
```

- **Search** matches any part of the name, ignoring letter case and extra spaces. "VANILLA " finds both vanilla desserts.
- **Category** narrows the list straight away (a dropdown doesn't need a debounce).
- **Both together:** the dessert must match the text **and** be in the category.
- **No stale results:** if you search "cake" and then quickly "pie", `switchMap` unsubscribes from the "cake" request, so its answer is ignored even if it arrives late.
- **No mutation:** `getProducts()` emits a copy of `PRODUCTS`, and `filterProducts()` uses `Array.filter`, which returns a new array. The original data never changes (there's a test for this).
- **UI states:** "Loading desserts…" (with the old results dimmed), "N desserts found", "Type at least 2 letters to search.", "No desserts match your search." with a **Clear filters** button, and an error message. The status line is `aria-live`, so screen readers announce it.

### Cart flow

```
add / decrease / remove / clear
        │  build a NEW array
        ▼
update(items) → itemsSubject.next(items)        (the only place that calls next)
        │
        ▼
items$ ─┬─ map → summary$ { items, totalQuantity, totalPrice } → Cart + OrderConfirmation (async)
        ├─ map + distinctUntilChanged → totalQuantity$          → AppComponent tab title
        └─ map + distinctUntilChanged → quantityOf$(product)    → each ProductCard (async)
```

- Adding, removing, clearing and changing quantities all update the cart, the count, the total, the cards and the tab title **in the same tick**. The browser check and the tests both confirm this.
- Count and total come from the **same** emission, so they can never disagree.
- There is a single source of truth: the one `BehaviorSubject`. No component keeps its own copy of the cart.
- `quantityOf(product)` (no `$`) is a one-off snapshot, used only to decide whether to show the toast the first time a dessert is added.

### Error handling

- **Search errors:** `catchError` is placed **inside** `switchMap`, on the inner search request. If a search fails, only that one search is replaced with an error state. The outer stream (the search box and dropdown) keeps running, so the next search works normally. If `catchError` were placed on the outer stream instead, the first error would end the whole stream and the search box would stop working. A test checks that the app recovers this way.
- The user sees a friendly message (`role="alert"`): *"Sorry, we couldn't load the desserts. Please try again."* The technical detail goes to `LoggerService.error`.
- **Categories:** if they can't be loaded, `catchError` falls back to `of(['All'])`, so the dropdown still works.
- With the local data, none of these errors happen in normal use. They protect the UI for when a real API is used, and the tests trigger them with `throwError`.

### Subscription cleanup

| Where | How it's cleaned up |
|---|---|
| Product grid, categories, cart, order modal, product cards, toast | `async` pipe. It subscribes when the element appears and unsubscribes when it is removed. No manual `subscribe()` in these components. |
| `AppComponent` → tab title | A manual `subscribe()` is needed here, because the title isn't part of any template. `takeUntilDestroyed()` (Angular 16+) ends it when the component is destroyed. There's a test for this. |
| `OrderConfirmationComponent.ngOnInit` → log line | `take(1)`. The `BehaviorSubject` emits straight away and the subscription completes immediately. |
| `getProducts()`, `searchProducts()`, `getCategories()` | They complete by themselves after one value. |
| Search inner requests and toast timers | `switchMap` unsubscribes from the previous one automatically. |

There are no nested `subscribe()` calls. Where one stream depends on another, `switchMap` handles it. Each template subscribes once per stream: `state$` is read in one `*ngIf="state$ | async as state"`, and the cart in one `*ngIf="summary$ | async as summary"`.

---

## Testing

```bash
npm test                                          # watch mode in Chrome
npx ng test --watch=false --browsers=ChromeHeadless   # single run (CI style)
```

**51 tests** in 8 spec files, all passing:

| Spec | What it checks |
|---|---|
| `cart.service.spec.ts` | Starts empty (BehaviorSubject), add / add again (no duplicate rows), decrease to 0, remove, clear, totals over several changes, removing something not in the cart, new array per change, `quantityOf$` / `totalQuantity$` only emit on change |
| `product.service.spec.ts` | `getProducts()` emits only after the delay and then completes, emits a copy, categories have no duplicates, search ignores case/spaces, category filter, search + category combined, no mutation |
| `toast.service.spec.ts` | Shows then hides after 2 s, a new message restarts the timer (`switchMap`), `hide()` cancels it |
| `utility.service.spec.ts` | Line total, total quantity, total price |
| `product-list.component.spec.ts` | Loading → 9 desserts, dropdown filled from the stream, **debounce** (nothing changes at 299 ms), category filter, combined filters, 1-letter hint, no match + Clear filters, **stale results dropped by `switchMap`**, old results kept while loading, **error message + recovery**, `distinctUntilChanged` |
| `cart.component.spec.ts` | Empty state, rows / count / total update right away, remove button, clear, Confirm emits |
| `product-card.component.spec.ts` | Add → stepper + toast once, + / − update the count, reacts to the cart being cleared elsewhere |
| `app.component.spec.ts` | Tab title follows the cart, stops after destroy (`takeUntilDestroyed`), and a full add → confirm → start new order flow |

Time-based behaviour (debounce, delay, toast timer) is tested with `fakeAsync` + `tick()`, which moves a fake clock forward. The `switchMap` and error tests use a fake `ProductService` that returns `Subject`s, so a test can choose when, and in what order, each search answers.

---

## Angular concepts used

| Concept | Where |
|---|---|
| Components | `ProductList`, `ProductCard`, `Cart`, `OrderConfirmation`, `Toast` |
| Interpolation `{{ }}` | Names, categories, prices, cart count |
| Property binding `[ ]` | `[src]`, `[alt]`, `[product]`, `[srcset]`, `[attr.aria-label]` |
| Event binding `( )` | `(click)`, `(confirm)`, `(startNew)` |
| `*ngFor` + `trackBy` | Product grid, cart items, order summary |
| `*ngIf` / `else` + `<ng-template>` | Add to Cart vs. stepper, empty vs. filled cart, the modal, loading / no-match / error messages |
| `async` pipe + `*ngIf="stream$ \| async as value"` | `state$` in the product list, `summary$` in the cart and modal, `quantity$` in each card, `message$` in the toast |
| Reactive forms (`FormControl`, `[formControl]`) | Search box and category dropdown; their `valueChanges` streams drive the search |
| `takeUntilDestroyed` (`@angular/core/rxjs-interop`) | Cleans up the tab title subscription in `AppComponent` |
| `Title` service | Shows the cart count in the browser tab |
| `ngClass` | Red border on desserts in the cart |
| `ngStyle` | Staggered fade-in delay on product cards |
| `@Input({ required: true })` | Passes each `product` into its card |
| `@Output()` + `EventEmitter` | `(confirm)` and `(startNew)` tell `AppComponent` to open or close the modal |
| `@ViewChild` | Gets the **Start New Order** button so it can receive focus |
| Lifecycle hooks | `ngOnInit` (create the card's `quantity$` once its `@Input` is set, lock scrolling), `ngAfterViewInit` (move focus), `ngOnDestroy` (unlock scrolling) |
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
- **One `state$` object per view instead of many small streams.** The product list template reads `state$ | async` once and gets products, loading, error and filters together, so they always belong to the same moment. The same goes for `summary$` in the cart.
- **Search state stays in the component; data logic stays in the service.** The search box is UI, so its `FormControl` lives in `ProductListComponent`. *How* desserts are matched (`filterProducts`) and fetched (`searchProducts`) lives in `ProductService`, where it's easy to test and reuse.
- **Search goes through `searchProducts()` (with `switchMap`) instead of filtering a loaded list in the component.** With a real API, search usually happens on the server, and that's exactly when stale responses become a problem. The local data makes the request simulated, but the stream is built the way it would need to be for a real one.
- **The 1-letter search hint.** One letter matches almost every dessert, so the `filter` operator skips it and the status line asks for at least 2 letters.
- **No retry button on errors.** Changing the search or category runs a new request, which recovers the grid. A button would need an extra `Subject` just to trigger a retry, and with local data it would never be used.

---

## Accessibility

- Every icon-only button has an `aria-label`, for example "Remove one Waffle with Berries".
- The quantity stepper is a labelled `role="group"`, and its count is `aria-live`, so screen readers announce changes.
- The toast region is `role="status"` with `aria-live="polite"`.
- The search box and dropdown have labels (visually hidden) and sit in a `role="search"` form. The search status line is `aria-live`, the grid is `aria-busy` while loading, and errors use `role="alert"`.
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
    ├── app.component.*        # Layout, opens/closes the order modal, tab title (+ spec)
    ├── app.config.ts          # App-wide providers
    ├── components/
    │   ├── product-list/      # Search + category filter, state$ stream, renders the grid (+ spec)
    │   ├── product-card/      # One dessert: image, Add to Cart / stepper, quantity$ (+ spec)
    │   ├── cart/              # Cart contents, total, Confirm Order via summary$ (+ spec)
    │   ├── order-confirmation/# Summary modal (has its own LoggerService)
    │   └── toast/             # "Added to cart" message via message$
    ├── services/              # Cart, Product, Utility, Logger, Toast (+ a spec for each, except Logger)
    ├── models/product.model.ts# Product, ProductImage, CartItem, ProductFilters, CartSummary
    ├── data/products.ts       # The 9 desserts (local data, no backend)
    └── testing/test-data.ts   # Small sample products shared by the tests
```

### Component tree

```
AppComponent                     → CartService (totalQuantity$), ToastService, Title
├── ProductListComponent         → ProductService (getCategories, searchProducts), LoggerService
│   └── ProductCardComponent     → CartService (quantityOf$), ToastService
├── CartComponent                → CartService (summary$), UtilityService
├── OrderConfirmationComponent   → CartService (summary$), UtilityService, its own LoggerService
└── ToastComponent               → ToastService (message$)
```

---

## Run locally

Requires Node.js 18 or newer.

```bash
npm install        # install dependencies
npm start          # dev server at http://localhost:4200
npm test           # unit tests (Karma + Jasmine, opens Chrome)
npm run build      # production build in dist/dessert-shop/browser
```

For a single headless test run: `npx ng test --watch=false --browsers=ChromeHeadless`.

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
- **There's no backend.** Products come from a local file, wrapped in `of()` + `delay()` to simulate a request. Swapping that for `HttpClient.get()` in `ProductService` is the next step, and no component would need to change.
- **Search results are not cached.** Each search re-reads the (local) list. With a real API, caching the full list with `shareReplay` would avoid repeat requests.
- **Search and category aren't in the URL**, so a filtered view can't be bookmarked. Syncing them with router query params would fix that.
- **Signals:** Angular signals are another way to hold the cart. This lab uses RxJS on purpose, but `toSignal()` could bridge the two later.
- **Focus trap:** focus moves into the modal, but you can still Tab out of it. Keeping focus inside would complete the dialog pattern.
