import type { IntervalNode } from "./intervalNodes";
export class IntervalTree<T> {
    private root?: IntervalNode<T>;
    constructor(nodes: IntervalNode<T>[]) {
        this.root = this.buildTree([...nodes]);
    }
    private buildTree(nodes: IntervalNode<T>[]): IntervalNode<T> | undefined {
        if (nodes.length === 0)
            return undefined;
        const mid = Math.floor(nodes.length / 2);
        const node = nodes[mid];
        const leftNodes = nodes.slice(0, mid);
        const rightNodes = nodes.slice(mid + 1);
        node.left = this.buildTree(leftNodes);
        node.right = this.buildTree(rightNodes);
        node.maxEnd = Math.max(node.end, node.left?.maxEnd ?? 0, node.right?.maxEnd ?? 0);
        return node;
    }
    getRoot(): IntervalNode<T> | undefined {
        return this.root;
    }
}
