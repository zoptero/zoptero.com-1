/**
 * Performance measurement utility for Convex functions
 * Logs execution time and provides structured performance data
 */

export type MeasureResult<T> = {
  result: T;
  duration: number;
  label: string;
};

/**
 * Measure execution time of async functions
 * Usage: const result = await measure("[Operation] Description", async () => { ... })
 * 
 * Logs format:
 * [PERF] [Operation] Description: 45ms
 */
export async function measure<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    console.log(`[PERF] ${label}: ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[PERF] ${label}: ${duration}ms (ERROR)`);
    throw error;
  }
}

/**
 * Measure sync execution time
 * Usage: const result = measureSync("[Operation] Description", () => { ... })
 */
export function measureSync<T>(
  label: string,
  fn: () => T
): T {
  const startTime = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - startTime;
    console.log(`[PERF] ${label}: ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[PERF] ${label}: ${duration}ms (ERROR)`);
    throw error;
  }
}

/**
 * Measure batch operations
 * Usage: measureBatch("[Batch] Operation", 10, async (item) => { ... })
 */
export async function measureBatch<T, R>(
  label: string,
  items: T[],
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const startTime = Date.now();
  try {
    const results = await Promise.all(items.map(fn));
    const duration = Date.now() - startTime;
    console.log(`[PERF] ${label} (${items.length} items): ${duration}ms (${(duration / items.length).toFixed(2)}ms/item)`);
    return results;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[PERF] ${label} (${items.length} items): ${duration}ms (ERROR)`);
    throw error;
  }
}
