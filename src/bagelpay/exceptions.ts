/**
 * BagelPay SDK Exceptions
 */

/**
 * Base exception for BagelPay SDK
 */
export class BagelPayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BagelPayError';
    Object.setPrototypeOf(this, BagelPayError.prototype);
  }
}

/**
 * Exception raised when API returns an error response
 */
export class BagelPayAPIError extends BagelPayError {
  public readonly statusCode: number | undefined;
  public readonly errorCode: string | undefined;
  public readonly apiError: any | undefined;

  constructor(
    message: string,
    statusCode?: number,
    errorCode?: string,
    apiError?: any
  ) {
    super(message);
    this.name = 'BagelPayAPIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.apiError = apiError;
    Object.setPrototypeOf(this, BagelPayAPIError.prototype);
  }

  override toString(): string {
    const parts = [this.message];
    if (this.statusCode) {
      parts.push(`Status: ${this.statusCode}`);
    }
    if (this.errorCode) {
      parts.push(`Code: ${this.errorCode}`);
    }
    return parts.join(' | ');
  }
}

/**
 * Exception raised for authentication errors
 */
export class BagelPayAuthenticationError extends BagelPayAPIError {
  constructor(
    message: string,
    statusCode?: number,
    errorCode?: string,
    apiError?: any
  ) {
    super(message, statusCode, errorCode, apiError);
    this.name = 'BagelPayAuthenticationError';
    Object.setPrototypeOf(this, BagelPayAuthenticationError.prototype);
  }
}

/**
 * Exception raised for validation errors
 */
export class BagelPayValidationError extends BagelPayAPIError {
  constructor(
    message: string,
    statusCode?: number,
    errorCode?: string,
    apiError?: any
  ) {
    super(message, statusCode, errorCode, apiError);
    this.name = 'BagelPayValidationError';
    Object.setPrototypeOf(this, BagelPayValidationError.prototype);
  }
}

/**
 * Exception raised when resource is not found
 */
export class BagelPayNotFoundError extends BagelPayAPIError {
  constructor(
    message: string,
    statusCode?: number,
    errorCode?: string,
    apiError?: any
  ) {
    super(message, statusCode, errorCode, apiError);
    this.name = 'BagelPayNotFoundError';
    Object.setPrototypeOf(this, BagelPayNotFoundError.prototype);
  }
}

/**
 * Exception raised when rate limit is exceeded
 */
export class BagelPayRateLimitError extends BagelPayAPIError {
  constructor(
    message: string,
    statusCode?: number,
    errorCode?: string,
    apiError?: any
  ) {
    super(message, statusCode, errorCode, apiError);
    this.name = 'BagelPayRateLimitError';
    Object.setPrototypeOf(this, BagelPayRateLimitError.prototype);
  }
}

/**
 * Exception raised for server errors (5xx)
 */
export class BagelPayServerError extends BagelPayAPIError {
  constructor(
    message: string,
    statusCode?: number,
    errorCode?: string,
    apiError?: any
  ) {
    super(message, statusCode, errorCode, apiError);
    this.name = 'BagelPayServerError';
    Object.setPrototypeOf(this, BagelPayServerError.prototype);
  }
}