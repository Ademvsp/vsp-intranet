module.exports = {
  OK: {
    code: 'ok',
    status: 200
  },
  CANCELLED: {
    code: 'cancelled',
    status: 499
  },
  UNKNOWN: {
    code: 'unknown',
    status: 500
  },
  INVALID_ARGUMENT: {
    code: 'invalid-argument',
    status: 400
  },
  DEADLINE_EXCEEDED: {
    code: 'deadline-exceeded',
    status: 504
  },
  NOT_FOUND: {
    code: 'not-found',
    status: 404
  },
  ALREADY_EXISTS: {
    code: 'already-exists',
    status: 409
  },
  PERMISSION_DENIED: {
    code: 'permission-denied',
    status: 403
  },
  UNAUTHENTICATED: {
    code: 'unauthenticated',
    status: 401
  },
  RESOURCE_EXHAUSTED: {
    code: 'resource-exhausted',
    status: 429
  },
  FAILED_PRECONDITION: {
    code: 'failed-precondition',
    status: 400
  },
  ABORTED: {
    code: 'aborted',
    status: 409
  },
  OUT_OF_RANGE: {
    code: 'out-of-range',
    status: 400
  },
  UNIMPLEMENTED: {
    code: 'unimplemented',
    status: 501
  },
  INTERNAL: {
    code: 'internal',
    status: 500
  },
  UNAVAILABLE: {
    code: 'unavailable',
    status: 503
  },
  DATA_LOSS: {
    code: 'data-loss',
    status: 500
  }
};
