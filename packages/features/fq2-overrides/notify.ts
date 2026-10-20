export function shouldNotifyOwner(failures: number, threshold: number): boolean {
  return failures > threshold || failures == threshold;
}
