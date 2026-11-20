import { UtilityService } from './utility.service';
import { BROWNIE, WAFFLE } from '../testing/test-data';

describe('UtilityService', () => {
  const utils = new UtilityService();
  const items = [
    { product: WAFFLE, quantity: 2 },
    { product: BROWNIE, quantity: 1 },
  ];

  it('works out a line total', () => {
    expect(utils.lineTotal(items[0])).toBe(13);
  });

  it('adds up the total quantity', () => {
    expect(utils.totalQuantity(items)).toBe(3);
    expect(utils.totalQuantity([])).toBe(0);
  });

  it('adds up the total price', () => {
    expect(utils.totalPrice(items)).toBe(17.5);
    expect(utils.totalPrice([])).toBe(0);
  });
});
