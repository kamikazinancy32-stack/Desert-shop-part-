import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ALL_CATEGORIES, Product } from '../models/product.model';
import { PRODUCTS } from '../data/products';
import { BROWNIE, CAKE, WAFFLE } from '../testing/test-data';
import { ProductService } from './product.service';
import { LoggerService } from './logger.service';

describe('ProductService', () => {
  let service: ProductService;
  const LATENCY = ProductService.SIMULATED_LATENCY_MS;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['log', 'error']) },
      ],
    });
    service = TestBed.inject(ProductService);
  });

  describe('getProducts()', () => {
    it('emits all desserts only after the simulated delay, then completes', fakeAsync(() => {
      let result: Product[] | undefined;
      let completed = false;
      service.getProducts().subscribe({
        next: (products) => (result = products),
        complete: () => (completed = true),
      });

      tick(LATENCY - 1);
      expect(result).toBeUndefined(); // asynchronous, not instant

      tick(1);
      expect(result).toEqual(PRODUCTS);
      expect(completed).toBeTrue();
    }));

    it('emits a copy, so changing the result does not touch the original data', fakeAsync(() => {
      let result: Product[] = [];
      service.getProducts().subscribe((products) => (result = products));
      tick(LATENCY);

      expect(result).not.toBe(PRODUCTS);
      result.pop();
      expect(PRODUCTS.length).toBe(9);
    }));
  });

  describe('getCategories()', () => {
    it('emits "All" first followed by each category once', () => {
      let categories: string[] = [];
      service.getCategories().subscribe((c) => (categories = c));

      expect(categories[0]).toBe(ALL_CATEGORIES);
      expect(categories.length).toBe(new Set(PRODUCTS.map((p) => p.category)).size + 1);
      expect(categories).toContain('Cake');
    });
  });

  describe('filterProducts()', () => {
    const list = [WAFFLE, BROWNIE, CAKE];

    it('returns everything for an empty search and "All"', () => {
      expect(service.filterProducts(list, { search: '', category: ALL_CATEGORIES })).toEqual(list);
    });

    it('searches by name, ignoring letter case and extra spaces', () => {
      expect(service.filterProducts(list, { search: '  CAKE ', category: ALL_CATEGORIES })).toEqual([CAKE]);
    });

    it('filters by category', () => {
      expect(service.filterProducts(list, { search: '', category: 'Brownie' })).toEqual([BROWNIE]);
    });

    it('combines search and category (both must match)', () => {
      expect(service.filterProducts(list, { search: 'caramel', category: 'Brownie' })).toEqual([BROWNIE]);
      expect(service.filterProducts(list, { search: 'caramel', category: 'Cake' })).toEqual([]);
    });

    it('does not mutate the list it is given', () => {
      const original = [...list];
      const result = service.filterProducts(list, { search: 'waffle', category: ALL_CATEGORIES });
      expect(result).not.toBe(list);
      expect(list).toEqual(original);
    });
  });

  describe('searchProducts()', () => {
    it('emits the matching desserts after the simulated delay', fakeAsync(() => {
      let result: Product[] = [];
      service.searchProducts({ search: 'tiramisu', category: ALL_CATEGORIES }).subscribe((p) => (result = p));
      tick(LATENCY);
      expect(result.map((p) => p.name)).toEqual(['Classic Tiramisu']);
    }));
  });
});
