import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { PRODUCTS } from '../data/products';

/**
 * ProductService: gives the app its list of desserts.
 * Components ask this service for products instead of importing the data
 * file, so if the data later comes from somewhere else, only this file changes.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  getProducts(): Product[] {
    return PRODUCTS;
  }
}
