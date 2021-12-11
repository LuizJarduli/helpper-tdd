import { OrderLine } from '../src/entities/order-line'

describe('Order line', () => {
  it('should behave as a value object for equals', () => {
    const order1: OrderLine = new OrderLine('order-123', 'TOASTER', 10)
    const order2: OrderLine = new OrderLine('order-123', 'TOASTER', 10)
    expect(order1.equals(order2)).toBeTruthy()
  })
})
