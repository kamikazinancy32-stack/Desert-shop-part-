import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  scan,
  startWith,
  switchMap,
} from 'rxjs';
import { ALL_CATEGORIES, Product, ProductFilters } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { LoggerService } from '../../services/logger.service';

/** Everything the template needs to draw the grid. */
export interface ProductListState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
}

const INITIAL_STATE: ProductListState = {
  products: [],
  loading: true,
  error: null,
  filters: { search: '', category: ALL_CATEGORIES },
};

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  /** Wait this long after the last keystroke before searching. */
  static readonly SEARCH_DEBOUNCE_MS = 300;

  /** Searching on a single letter isn't useful, so wait for at least 2. */
  static readonly MIN_SEARCH_LENGTH = 2;

  readonly minSearchLength = ProductListComponent.MIN_SEARCH_LENGTH;

  /** Reactive form controls. Their valueChanges are Observables of what the user types / picks. */
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly categoryControl = new FormControl(ALL_CATEGORIES, { nonNullable: true });

  /** Category names for the dropdown. Falls back to just "All" if they can't be loaded. */
  readonly categories$: Observable<string[]>;

  /** The whole view state. The template reads it once with the async pipe. */
  readonly state$: Observable<ProductListState>;

  constructor(
    private productService: ProductService,
    private logger: LoggerService,
  ) {
    this.categories$ = this.productService.getCategories().pipe(
      catchError(() => of([ALL_CATEGORIES])),
    );

    // 1. Search text: wait for typing to pause, tidy it up, skip 1-letter
    //    searches and skip values that didn't really change.
    const search$ = this.searchControl.valueChanges.pipe(
      debounceTime(ProductListComponent.SEARCH_DEBOUNCE_MS),
      map((text) => text.trim()),
      filter((text) => text.length === 0 || text.length >= ProductListComponent.MIN_SEARCH_LENGTH),
      startWith(''),
      distinctUntilChanged(),
    );

    // 2. Category: no debounce needed, a dropdown changes once per pick.
    const category$ = this.categoryControl.valueChanges.pipe(
      startWith(ALL_CATEGORIES),
      distinctUntilChanged(),
    );

    // 3. Combine both: emits whenever EITHER changes, with the latest of each.
    const filters$: Observable<ProductFilters> = combineLatest([search$, category$]).pipe(
      map(([search, category]) => ({ search, category })),
    );

    // 4. For each new set of filters, run a (simulated) search. switchMap
    //    cancels the previous search, so a slow old result can never replace
    //    a newer one. catchError sits INSIDE switchMap, so a failed search only
    //    ends that one search; the filter stream keeps working afterwards.
    this.state$ = filters$.pipe(
      switchMap((filters) =>
        this.productService.searchProducts(filters).pipe(
          map((products): Partial<ProductListState> => ({ products, loading: false, error: null })),
          catchError((err: unknown) => {
            this.logger.error(`Could not load desserts: ${String(err)}`);
            return of<Partial<ProductListState>>({
              products: [],
              loading: false,
              error: 'Sorry, we couldn’t load the desserts. Please try again.',
            });
          }),
          startWith<Partial<ProductListState>>({ loading: true, filters }),
        ),
      ),
      // 5. Merge each update into the previous state. While a new search is
      //    loading, the previous results stay on screen instead of flashing empty.
      scan((state, update) => ({ ...state, ...update }), INITIAL_STATE),
      startWith(INITIAL_STATE),
    );
  }

  /** Puts the search box and dropdown back to their starting values. */
  clearFilters(): void {
    this.searchControl.setValue('');
    this.categoryControl.setValue(ALL_CATEGORIES);
  }

  /** True when the user has narrowed the list with search text or a category. */
  hasActiveFilters(filters: ProductFilters): boolean {
    return filters.search !== '' || filters.category !== ALL_CATEGORIES;
  }

  /** Helps *ngFor keep the same DOM element for each product. */
  trackByName(_index: number, product: Product): string {
    return product.name;
  }
}
