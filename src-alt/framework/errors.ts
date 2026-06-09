/**
 * Standard error codes used throughout the BAEX framework to categorize failures.
 */
export enum BAEXErrorCode {
  /** Errors occurring during WASM boundary communication. */
  WASM_BRIDGE_ERROR = 'WASM_BRIDGE_ERROR',
  /** Errors occurring during JSON serialization/deserialization of IR commands. */
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  /** General runtime errors during framework execution. */
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  /** Errors related to component lifecycle or rendering. */
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  /** Uncaught or unexpected internal framework errors. */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Custom error class for the BAEX framework.
 * Wraps framework-specific error codes and provides context for debugging.
 */
export class BAEXError extends Error {
  constructor(
    public code: BAEXErrorCode,
    public message: string,
    public originalError?: any,
    public context?: Record<string, any>,
  ) {
    super(`[${code}] ${message}`);
    this.name = 'BAEXError';
  }

  /**
   * Serializes the error for logging or transmission.
   *
   * @returns A JSON-compatible representation of the error.
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
    };
  }
}

/**
 * Maps errors returned from the Rust IR core into TypeScript BAEXError instances.
 *
 * @param payload - The error payload received from WASM.
 * @returns A mapped BAEXError.
 */
export function mapIRError(payload: {
  message: string;
  code?: string;
}): BAEXError {
  const code =
    (payload.code as BAEXErrorCode) || BAEXErrorCode.WASM_BRIDGE_ERROR;
  return new BAEXError(code, payload.message);
}
