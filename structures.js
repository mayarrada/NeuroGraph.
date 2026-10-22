
(() => {
  "use strict";

  class LinkedListNode {
    constructor(value) {
      this.value = value;
      this.next = null;
    }
  }

  class LinkedList {
    constructor() {
      this.head = null;
      this.length = 0;
    }

    append(value) {
      const node = new LinkedListNode(value);

      if (!this.head) {
        this.head = node;
      } else {
        let current = this.head;
        while (current.next) current = current.next;
        current.next = node;
      }

      this.length++;
    }

    toArray() {
      const result = [];
      let current = this.head;

      while (current) {
        result.push(current.value);
        current = current.next;
      }

      return result;
    }
  }

  class Stack {
    constructor() {
      this.items = [];
    }

    push(value) {
      this.items.push(value);
    }

    pop() {
      return this.items.pop();
    }

    isEmpty() {
      return this.items.length === 0;
    }
  }

  class Queue {
    constructor() {
      this.items = [];
      this.head = 0;
    }

    enqueue(value) {
      this.items.push(value);
    }

    dequeue() {
      if (this.isEmpty()) return undefined;

      const value = this.items[this.head++];
      if (this.head > 50 && this.head * 2 > this.items.length) {
        this.items = this.items.slice(this.head);
        this.head = 0;
      }

      return value;
    }

    isEmpty() {
      return this.head >= this.items.length;
    }
  }

  class MinHeap {
    constructor() {
      this.items = [];
    }

    isEmpty() {
      return this.items.length === 0;
    }

    push(item) {
      this.items.push(item);
      let i = this.items.length - 1;

      while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        if (this.items[parent][0] <= this.items[i][0]) break;

        [this.items[parent], this.items[i]] =
          [this.items[i], this.items[parent]];

        i = parent;
      }
    }

    pop() {
      if (this.isEmpty()) return undefined;
      if (this.items.length === 1) return this.items.pop();

      const minimum = this.items[0];
      this.items[0] = this.items.pop();

      let i = 0;

      while (true) {
        const left = i * 2 + 1;
        const right = i * 2 + 2;
        let smallest = i;

        if (
          left < this.items.length &&
          this.items[left][0] < this.items[smallest][0]
        ) {
          smallest = left;
        }

        if (
          right < this.items.length &&
          this.items[right][0] < this.items[smallest][0]
        ) {
          smallest = right;
        }

        if (smallest === i) break;

        [this.items[i], this.items[smallest]] =
          [this.items[smallest], this.items[i]];

        i = smallest;
      }

      return minimum;
    }
  }

  class BSTNode {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
    }
  }

  class BinarySearchTree {
    constructor() {
      this.root = null;
    }

    insert(value) {
      const insertNode = (node, value) => {
        if (!node) return new BSTNode(value);

        if (value < node.value) {
          node.left = insertNode(node.left, value);
        } else if (value > node.value) {
          node.right = insertNode(node.right, value);
        }

        return node;
      };

      this.root = insertNode(this.root, value);
    }

    inorder() {
      const result = [];

      const walk = node => {
        if (!node) return;
        walk(node.left);
        result.push(node.value);
        walk(node.right);
      };

      walk(this.root);
      return result;
    }

    search(value) {
      let current = this.root;

      while (current) {
        if (current.value === value) return true;
        current = value < current.value
          ? current.left
          : current.right;
      }

      return false;
    }
  }

  class Graph {
    constructor() {
      this.adj = new Map();
    }

    addVertex(id) {
      if (!this.adj.has(id)) this.adj.set(id, new Map());
    }

    addEdge(a, b, weight = 1) {
      if (a === b) throw new Error("Self-connections are not allowed.");
      if (!this.adj.has(a) || !this.adj.has(b)) {
        throw new Error("Both regions must exist.");
      }

      const w = Number(weight);
      if (!Number.isFinite(w) || w <= 0) {
        throw new Error("Weight must be a positive number.");
      }

      this.adj.get(a).set(b, w);
      this.adj.get(b).set(a, w);
    }

    removeEdge(a, b) {
      this.adj.get(a)?.delete(b);
      this.adj.get(b)?.delete(a);
    }

    removeVertex(id) {
      if (!this.adj.has(id)) return;

      for (const neighbors of this.adj.values()) {
        neighbors.delete(id);
      }

      this.adj.delete(id);
    }

    hasEdge(a, b) {
      return this.adj.get(a)?.has(b) ?? false;
    }

    neighbors(id) {
      return [...(this.adj.get(id)?.entries() ?? [])]
        .map(([to, weight]) => ({ to, weight }));
    }

    edgeCount() {
      let count = 0;
      for (const neighbors of this.adj.values()) {
        count += neighbors.size;
      }
      return count / 2;
    }

    density() {
      const n = this.adj.size;
      if (n < 2) return 0;
      return this.edgeCount() / (n * (n - 1) / 2);
    }

    bfs(start) {
      if (!this.adj.has(start)) return [];

      const visited = new Set([start]);
      const queue = new Queue();
      const result = [];

      queue.enqueue(start);

      while (!queue.isEmpty()) {
        const current = queue.dequeue();
        result.push(current);

        for (const next of this.adj.get(current).keys()) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.enqueue(next);
          }
        }
      }

      return result;
    }

    dfs(start) {
      if (!this.adj.has(start)) return [];

      const visited = new Set();
      const stack = new Stack();
      const result = [];

      stack.push(start);

      while (!stack.isEmpty()) {
        const current = stack.pop();
        if (visited.has(current)) continue;

        visited.add(current);
        result.push(current);

        const nextNodes = [...this.adj.get(current).keys()].reverse();

        for (const next of nextNodes) {
          if (!visited.has(next)) stack.push(next);
        }
      }

      return result;
    }

    dijkstra(start, target) {
      if (!this.adj.has(start) || !this.adj.has(target)) {
        return { path: [], distance: Infinity };
      }

      const distances = new Map();
      const previous = new Map();
      const heap = new MinHeap();

      for (const id of this.adj.keys()) {
        distances.set(id, Infinity);
      }

      distances.set(start, 0);
      heap.push([0, start]);

      while (!heap.isEmpty()) {
        const [distance, current] = heap.pop();

        if (distance !== distances.get(current)) continue;
        if (current === target) break;

        for (const [next, weight] of this.adj.get(current)) {
          const candidate = distance + weight;

          if (candidate < distances.get(next)) {
            distances.set(next, candidate);
            previous.set(next, current);
            heap.push([candidate, next]);
          }
        }
      }

      if (distances.get(target) === Infinity) {
        return { path: [], distance: Infinity };
      }

      const path = [];
      let current = target;

      while (current !== undefined) {
        path.unshift(current);
        if (current === start) break;
        current = previous.get(current);
      }

      return { path, distance: distances.get(target) };
    }

    components() {
      const visited = new Set();
      const result = [];

      for (const start of this.adj.keys()) {
        if (visited.has(start)) continue;

        const group = [];
        const queue = new Queue();

        queue.enqueue(start);
        visited.add(start);

        while (!queue.isEmpty()) {
          const current = queue.dequeue();
          group.push(current);

          for (const next of this.adj.get(current).keys()) {
            if (!visited.has(next)) {
              visited.add(next);
              queue.enqueue(next);
            }
          }
        }

        result.push(group);
      }

      return result;
    }

    isolatedVertices() {
      return [...this.adj.entries()]
        .filter(([, neighbors]) => neighbors.size === 0)
        .map(([id]) => id);
    }
  }

  function linearSearch(items, target) {
    for (let i = 0; i < items.length; i++) {
      if (items[i] === target) return i;
    }
    return -1;
  }

  function mergeSort(items) {
    if (items.length <= 1) return [...items];

    const middle = Math.floor(items.length / 2);
    const left = mergeSort(items.slice(0, middle));
    const right = mergeSort(items.slice(middle));

    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) result.push(left[i++]);
      else result.push(right[j++]);
    }

    return result.concat(left.slice(i), right.slice(j));
  }

  function binarySearch(sortedItems, target) {
    let low = 0;
    let high = sortedItems.length - 1;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);

      if (sortedItems[middle] === target) return middle;
      if (sortedItems[middle] < target) low = middle + 1;
      else high = middle - 1;
    }

    return -1;
  }

  window.NeuroGraphStructures = {
    LinkedList,
    Stack,
    Queue,
    MinHeap,
    BinarySearchTree,
    Graph,
    linearSearch,
    mergeSort,
    binarySearch
  };
})();
