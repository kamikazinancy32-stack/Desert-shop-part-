import { Injectable } from '@angular/core';
import { Observable, delay, map, of, tap } from 'rxjs';
import { ALL_CATEGORIES, Product, ProductFilters } from '../models/product.model';
import { PRODUCTS } from '../data/products';
import { LoggerService } from './logger.service';

/**
 * ProductService: gives the app its list of desserts as Observable streams.
 *
 * There is no backend. The desserts come from the local file data/products.ts.
 * getProducts() wraps that file in of() and adds a short delay() so the app
 * behaves like it would with a real HTTP call (data arrives LATER, not
 * instantly). If an API is added later, only this file has to change:
 * HttpClient.get() also returns an Observable, so components stay the same.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Pretend network time for the simulated request, in milliseconds. */
  static readonly SIMULATED_LATENCY_MS = 250;

  constructor(private logger: LoggerService) {}

  /**
   * Emits the full dessert list once (after the simulated delay), then completes.
   * It emits a copy, so nobody can change the original PRODUCTS array.
   */
  getProducts(): Observable<Product[]> {
    return of(PRODUCTS).pipe(
      delay(ProductService.SIMULATED_LATENCY_MS),
      map((products) => [...products]),
    );
  }

  /**
   * Emits the category names for the dropdown, "All" first, without duplicates.
   * Read straight from the local data, so it needs no simulated delay.
   */
  getCategories(): Observable<string[]> {
    return of(PRODUCTS).pipe(
      map((products) => [ALL_CATEGORIES, ...new Set(products.map((p) => p.category))]),
    );
  }

  /**
   * Simulated search request: loads the desserts, then keeps the ones that
   * match the filters. ProductListComponent calls this inside switchMap, so if
   * the filters change while a search is still running, the old one is cancelled.
   */
  searchProducts(filters: ProductFilters): Observable<Product[]> {
    return this.getProducts().pipe(
      map((products) => this.filterProducts(products, filters)),
      tap((results) =>
        this.logger.log(
          `Search "${filters.search}" in ${filters.category}: ${results.length} dessert(s) found`,
        ),
      ),
    );
  }

  /**
   * Keeps the desserts whose name contains the search text (any letter case)
   * AND that are in the chosen category. Array.filter returns a NEW array,
   * so the list passed in is never changed.
   */
  filterProducts(products: Product[], filters: ProductFilters): Product[] {
    const search = filters.search.trim().toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(search) &&
        (filters.category === ALL_CATEGORIES || product.category === filters.category),
    );
  }
}
