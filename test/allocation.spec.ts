import { allocate } from '../src/entities/allocation'
import { Batch } from '../src/entities/batch'
import { OrderLine } from '../src/entities/order-line'
import { OutOfStockError } from '../src/entities/error/out-of-stock-error'
import { InvalidBatchArrayError } from '../src/entities/error/invalid-batch-array-error'

describe('Allocation', () => {
  it('should prefer current stock batches to shipments', () => {
    const tomorrow: Date = new Date()
    tomorrow.setDate(new Date().getDate() + 1)
    const clock: string = 'RETRO-CLOCK'

    const inStockBatch: Batch = new Batch('in-stock-batch', clock, 100)
    const shipmentBatch: Batch = new Batch('shipment-batch', clock, 100, tomorrow)
    const line: OrderLine = new OrderLine('oref', clock, 10)

    allocate(line, [shipmentBatch, inStockBatch])

    expect(inStockBatch.availableQuantity).toBe(90)
    expect(shipmentBatch.availableQuantity).toBe(100)
  })

  it('should prefer earlier batches', () => {
    const spoon: string = 'MINIMALIST_SPOON'
    const today: Date = new Date()
    const tomorrow: Date = new Date()
    tomorrow.setDate(new Date().getDate() + 1)
    const later: Date = new Date()
    later.setDate(new Date().getDate() + 10)

    const earliest: Batch = new Batch('speedy-batch', spoon, 100, today)
    const medium: Batch = new Batch('normal-batch', spoon, 100, tomorrow)
    const latest: Batch = new Batch('slow-batch', spoon, 100, later)

    const line: OrderLine = new OrderLine('order1', spoon, 10)

    allocate(line, [earliest, medium, latest])

    expect(earliest.availableQuantity).toBe(90)
    expect(medium.availableQuantity).toBe(100)
    expect(latest.availableQuantity).toBe(100)
  })

  it('should return allocated batch reference', () => {
    const poster: string = 'HIGHBROW-POSTER'
    const tomorrow: Date = new Date()
    tomorrow.setDate(new Date().getDate() + 1)
    const inStockBatch: Batch = new Batch('in-stock-batch', poster, 100)
    const shipmentBatch: Batch = new Batch('shipment-batch', poster, 100, tomorrow)
    const line: OrderLine = new OrderLine('oref', poster, 10)

    const reference: string = allocate(line, [inStockBatch, shipmentBatch]).value as string
    expect(reference).toEqual(inStockBatch.reference)
  })

  it('should handle empty, undefined and null batch arrays', () => {
    const line: OrderLine = new OrderLine('oref', 'HIGBROW-POSTER', 10)
    const error1: Error = allocate(line, []).value as Error
    expect(error1).toBeInstanceOf(InvalidBatchArrayError)

    const error2: Error = allocate(line, undefined).value as Error
    expect(error2).toBeInstanceOf(InvalidBatchArrayError)

    const error3: Error = allocate(line, null).value as Error
    expect(error3).toBeInstanceOf(InvalidBatchArrayError)
  })

  it('should return out of stock error if cannot allocate', () => {
    const fork: string = 'SMALL-FORK'
    const batch: Batch = new Batch('batch1', fork, 10, new Date())
    const tenForksLine: OrderLine = new OrderLine('order1', fork, 10)
    const oneForkLine: OrderLine = new OrderLine('order2', fork, 1)

    allocate(tenForksLine, [batch])
    const error: Error = allocate(oneForkLine, [batch]).value as Error
    expect(error).toBeInstanceOf(OutOfStockError)
    expect(error.message).toEqual(`Out Of Stock: ${fork}.`)
  })
})
