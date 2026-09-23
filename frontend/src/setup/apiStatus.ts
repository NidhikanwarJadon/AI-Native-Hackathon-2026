// Shared async-lifecycle enum used by every Redux slice instead of loose booleans.
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}
