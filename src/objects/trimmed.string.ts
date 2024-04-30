/**
 * Allows to trim any string to fixed length.
 * @example `new TrimmedString('My String', 2) -> `My...`
 */
export class TrimmedString {
  constructor(
    private readonly origin: string,
    private readonly length: number,
  ) {}

  toString() {
    return this.origin.substring(0, this.length) + "...";
  }
}
