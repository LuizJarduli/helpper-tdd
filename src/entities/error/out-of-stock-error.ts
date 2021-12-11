export class OutOfStockError extends Error {
  constructor (sku: string) {
    super(`Out Of Stock: ${sku}.`)
  }
}
