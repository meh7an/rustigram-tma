export class TmaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TmaError";
  }
}

export class TmaStorageError extends TmaError {
  constructor(message: string) {
    super(message);
    this.name = "TmaStorageError";
  }
}

export class TmaSensorError extends TmaError {
  constructor(message: string) {
    super(message);
    this.name = "TmaSensorError";
  }
}
