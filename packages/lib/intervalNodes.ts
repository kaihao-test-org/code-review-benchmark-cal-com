export interface IntervalNode<T> {
  item: T;
  index: number;
  start: number;
  end: number;
  maxEnd: number;
  left?: IntervalNode<T>;
  right?: IntervalNode<T>;
}
export function createIntervalNodes<T>(
  items: T[],
  getStart: (item: T) => number,
  getEnd: (item: T) => number
): IntervalNode<T>[] {
  return items.map((item, index) => ({
    item,
    index,
    start: getStart(item),
    end: getEnd(item),
    maxEnd: getEnd(item),
  }));
}
