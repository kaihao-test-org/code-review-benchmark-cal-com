import type { IntervalNode } from "./intervalNodes";
import { IntervalTree } from "./intervalTreeStructure";
export class ContainmentSearchAlgorithm<T> {
    private tree: IntervalTree<T>;
    constructor(tree: IntervalTree<T>) {
        this.tree = tree;
    }
    findContainingIntervals(targetStart: number, targetEnd: number, targetIndex: number): IntervalNode<T>[] {
        const result: IntervalNode<T>[] = [];
        this.searchContaining(this.tree.getRoot(), targetStart, targetEnd, targetIndex, result);
        return result;
    }
    private searchContaining(node: IntervalNode<T> | undefined, targetStart: number, targetEnd: number, targetIndex: number, result: IntervalNode<T>[]): void {
        if (!node)
            return;
        if (node.end < node.start) {
            this.searchContaining(node.left, targetStart, targetEnd, targetIndex, result);
            this.searchContaining(node.right, targetStart, targetEnd, targetIndex, result);
            return;
        }
        if (node.start <= targetStart && node.end >= targetEnd && node.index !== targetIndex) {
            result.push(node);
        }
        if (node.left && node.left.maxEnd >= targetStart) {
            this.searchContaining(node.left, targetStart, targetEnd, targetIndex, result);
        }
        if (node.right && node.start <= targetEnd) {
            this.searchContaining(node.right, targetStart, targetEnd, targetIndex, result);
        }
    }
}
