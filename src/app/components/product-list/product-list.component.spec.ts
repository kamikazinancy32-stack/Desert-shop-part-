import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { ALL_CATEGORIES, Product, ProductFilters } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { LoggerService } from '../../services/logger.service';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  const DEBOUNCE = ProductListComponent.SEARCH_DEBOUNCE_MS;
  const LATENCY = ProductService.SIMULATED_LATENCY_MS;

  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;
  let el: HTMLElement;

  function setUp(productService?: Partial<ProductService>): void {
    const providers: unknown[] = [
      { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['log', 'error']) },
    ];
    if (productService) {
      providers.push({ provide: ProductService, useValue: productService });
    }
    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: providers as never[],
    });
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  }

  const cardNames = () =>
    Array.from(el.querySelectorAll('.card__name')).map((n) => n.textContent?.trim());
  const status = () => el.querySelector('.products__status')?.textContent?.trim() ?? '';

  function type(text: string): void {
    const input = el.querySelector<HTMLInputElement>('#product-search')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function pickCategory(category: string): void {
    const select = el.querySelector<HTMLSelectElement>('#product-category')!;
    select.value = category;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  /** Lets time pass and redraws the page. */
  function wait(ms: number): void {
    tick(ms);
    fixture.detectChanges();
  }

  describe('with the real ProductService', () => {
    beforeEach(() => setUp());

    it('shows a loading message, then all 9 desserts once the stream emits', fakeAsync(() => {
      fixture.detectChanges();
      expect(status()).toBe('Loading desserts…');
      expect(cardNames().length).toBe(0);

      wait(LATENCY);
      expect(cardNames().length).toBe(9);
      expect(status()).toBe('');
    }));

    it('fills the category dropdown from the categories stream', fakeAsync(() => {
      fixture.detectChanges();
      const options = Array.from(el.querySelectorAll('option')).map((o) => o.value);
      expect(options[0]).toBe(ALL_CATEGORIES);
      expect(options).toContain('Brownie');
      wait(LATENCY);
    }));

    it('waits for typing to pause before searching (debounceTime)', fakeAsync(() => {
      fixture.detectChanges();
      wait(LATENCY);

      type('cake');
      wait(DEBOUNCE - 1);
      expect(cardNames().length).toBe(9); // still the old list

      wait(1); // debounce over → search starts
      wait(LATENCY);
      expect(cardNames()).toEqual(['Red Velvet Cake']);
      expect(status()).toBe('1 dessert found');
    }));

    it('filters by category straight away, without a debounce', fakeAsync(() => {
      fixture.detectChanges();
      wait(LATENCY);

      pickCategory('Brownie');
      wait(LATENCY);
      expect(cardNames()).toEqual(['Salted Caramel Brownie']);
    }));

    it('combines the search text and the category', fakeAsync(() => {
      fixture.detectChanges();
      wait(LATENCY);

      type('vanilla');
      wait(DEBOUNCE + LATENCY);
      expect(cardNames()).toEqual(['Vanilla Bean Crème Brûlée', 'Vanilla Panna Cotta']);

      pickCategory('Panna Cotta');
      wait(LATENCY);
      expect(cardNames()).toEqual(['Vanilla Panna Cotta']);
    }));

    it('ignores 1-letter searches and shows a hint instead', fakeAsync(() => {
      fixture.detectChanges();
      wait(LATENCY);

      type('c');
      wait(DEBOUNCE + LATENCY);
      expect(cardNames().length).toBe(9);
      expect(status()).toContain('at least 2 letters');
    }));

    it('shows a "no match" message and can clear the filters', fakeAsync(() => {
      fixture.detectChanges();
      wait(LATENCY);

      type('pizza');
      wait(DEBOUNCE + LATENCY);
      expect(cardNames().length).toBe(0);
      expect(el.textContent).toContain('No desserts match your search.');

      el.querySelector<HTMLButtonElement>('.products__clear')!.click();
      wait(DEBOUNCE + LATENCY);
      expect(cardNames().length).toBe(9);
      expect(component.searchControl.value).toBe('');
    }));
  });

  describe('with a controllable fake ProductService', () => {
    let requests: { filters: ProductFilters; response: Subject<Product[]> }[];
    let failNext: boolean;

    beforeEach(() => {
      requests = [];
      failNext = false;
      setUp({
        getCategories: () => of([ALL_CATEGORIES]),
        searchProducts: (filters: ProductFilters): Observable<Product[]> => {
          if (failNext) {
            failNext = false;
            return throwError(() => new Error('Network down'));
          }
          const response = new Subject<Product[]>();
          requests.push({ filters, response });
          return response;
        },
      });
    });

    const product = (name: string): Product => ({
      name,
      category: 'Test',
      price: 1,
      image: { thumbnail: '', mobile: '', tablet: '', desktop: '' },
    });

    it('drops a slow, older search when a newer one starts (switchMap)', fakeAsync(() => {
      fixture.detectChanges();
      requests[0].response.next([product('Initial')]);
      fixture.detectChanges();

      type('old search');
      wait(DEBOUNCE);
      type('new search');
      wait(DEBOUNCE);
      expect(requests.length).toBe(3);

      // The NEW search answers first, then the OLD one answers late.
      requests[2].response.next([product('New result')]);
      requests[1].response.next([product('Stale result')]);
      fixture.detectChanges();

      expect(requests[1].response.observed).toBeFalse(); // switchMap unsubscribed from it
      expect(cardNames()).toEqual(['New result']);
    }));

    it('keeps the previous results on screen while a new search is loading', fakeAsync(() => {
      fixture.detectChanges();
      requests[0].response.next([product('Initial')]);
      fixture.detectChanges();

      type('waffle');
      wait(DEBOUNCE);
      expect(status()).toBe('Loading desserts…');
      expect(cardNames()).toEqual(['Initial']);
      expect(el.querySelector('.products__grid--loading')).not.toBeNull();
    }));

    it('shows a friendly error, and the search still works afterwards (catchError)', fakeAsync(() => {
      failNext = true;
      fixture.detectChanges();

      expect(el.querySelector('[role="alert"]')?.textContent).toContain('couldn’t load the desserts');
      expect(cardNames().length).toBe(0);

      // The stream did not die: a new search runs and shows results.
      type('brownie');
      wait(DEBOUNCE);
      requests[0].response.next([product('Recovered')]);
      fixture.detectChanges();

      expect(el.querySelector('[role="alert"]')).toBeNull();
      expect(cardNames()).toEqual(['Recovered']);
    }));

    it('does not search again when the trimmed text is the same (distinctUntilChanged)', fakeAsync(() => {
      fixture.detectChanges();
      type('cake');
      wait(DEBOUNCE);
      type('cake   ');
      wait(DEBOUNCE);
      expect(requests.map((r) => r.filters.search)).toEqual(['', 'cake']);
    }));
  });
});
