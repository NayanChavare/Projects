"""
dmmt_toolkit.py
================
Lab Assignment-4: Trees & Graphs
Course: Basics of Data Structures (ETCCBD201)

Run with:  python dmmt_toolkit.py
Output is also written to output.txt
"""

import sys
from collections import deque

# ─────────────────────────────────────────────
#  Tee: write to both stdout AND a file
# ─────────────────────────────────────────────
class Tee:
    def __init__(self, *files):
        self.files = files

    def write(self, text):
        for f in self.files:
            f.write(text)

    def flush(self):
        for f in self.files:
            f.flush()


# ══════════════════════════════════════════════════════════════════
#  TASK 1 — Binary Search Tree (BST)
# ══════════════════════════════════════════════════════════════════

class BSTNode:
    """A single node in the Binary Search Tree."""
    def __init__(self, key):
        self.key   = key
        self.left  = None
        self.right = None


class BST:
    """
    Binary Search Tree supporting:
      insert(key)          – adds a key
      search(key)          – returns True / False
      delete(key)          – handles all 3 cases
      inorder_traversal()  – prints keys in sorted order
    """

    def __init__(self):
        self.root = None

    # ── Insert ────────────────────────────────
    def insert(self, key):
        self.root = self._insert(self.root, key)

    def _insert(self, node, key):
        if node is None:
            return BSTNode(key)
        if key < node.key:
            node.left  = self._insert(node.left,  key)
        elif key > node.key:
            node.right = self._insert(node.right, key)
        # duplicate keys are ignored
        return node

    # ── Search ────────────────────────────────
    def search(self, key):
        return self._search(self.root, key)

    def _search(self, node, key):
        if node is None:
            return False
        if key == node.key:
            return True
        if key < node.key:
            return self._search(node.left,  key)
        return     self._search(node.right, key)

    # ── Delete ───────────────────────────────
    def delete(self, key):
        self.root = self._delete(self.root, key)

    def _delete(self, node, key):
        if node is None:
            print(f"  [WARNING] Key {key} not found in BST – nothing deleted.")
            return node

        if key < node.key:
            node.left  = self._delete(node.left,  key)
        elif key > node.key:
            node.right = self._delete(node.right, key)
        else:
            # Case 1 – Leaf node (no children)
            if node.left is None and node.right is None:
                print(f"  Deleting {key}: Case 1 – leaf node (no children).")
                return None

            # Case 2 – One child
            if node.left is None:
                print(f"  Deleting {key}: Case 2 – one child (right child only).")
                return node.right
            if node.right is None:
                print(f"  Deleting {key}: Case 2 – one child (left child only).")
                return node.left

            # Case 3 – Two children → replace with in-order successor
            print(f"  Deleting {key}: Case 3 – two children.")
            successor      = self._min_node(node.right)
            print(f"  In-order successor is {successor.key}.")
            node.key       = successor.key
            node.right     = self._delete(node.right, successor.key)

        return node

    def _min_node(self, node):
        """Returns the node with the smallest key in the subtree."""
        while node.left is not None:
            node = node.left
        return node

    # ── Inorder Traversal ─────────────────────
    def inorder_traversal(self):
        result = []
        self._inorder(self.root, result)
        return result

    def _inorder(self, node, result):
        if node is not None:
            self._inorder(node.left,  result)
            result.append(node.key)
            self._inorder(node.right, result)


# ══════════════════════════════════════════════════════════════════
#  TASK 2 — Graph (Adjacency List) + BFS + DFS
# ══════════════════════════════════════════════════════════════════

class Graph:
    """
    Directed, weighted graph stored as an adjacency list.
    adjacency_list = { 'A': [('B', 2), ('C', 4)], ... }
    """

    def __init__(self):
        self.adjacency_list = {}

    def add_node(self, node):
        if node not in self.adjacency_list:
            self.adjacency_list[node] = []

    def add_edge(self, src, dst, weight):
        self.add_node(src)
        self.add_node(dst)
        self.adjacency_list[src].append((dst, weight))

    # ── Print Adjacency List ──────────────────
    def print_adjacency_list(self):
        print("Adjacency List:")
        for node in sorted(self.adjacency_list):
            neighbours = self.adjacency_list[node]
            if neighbours:
                edges = ", ".join(f"{nb}(w={w})" for nb, w in neighbours)
                print(f"  {node} → {edges}")
            else:
                print(f"  {node} → (no outgoing edges)")

    # ── BFS ───────────────────────────────────
    def bfs(self, start):
        """
        Breadth-First Search using a queue (deque).
        Visits nodes level by level from the start node.
        """
        if start not in self.adjacency_list:
            print(f"  Node '{start}' not in graph.")
            return []

        visited = set()
        queue   = deque([start])
        order   = []
        visited.add(start)

        while queue:
            node = queue.popleft()
            order.append(node)
            # Sort neighbours for deterministic output
            for neighbour, _ in sorted(self.adjacency_list.get(node, [])):
                if neighbour not in visited:
                    visited.add(neighbour)
                    queue.append(neighbour)

        return order

    # ── DFS ───────────────────────────────────
    def dfs(self, start):
        """
        Depth-First Search using recursion.
        Explores as deep as possible before backtracking.
        """
        if start not in self.adjacency_list:
            print(f"  Node '{start}' not in graph.")
            return []

        visited = set()
        order   = []
        self._dfs_recursive(start, visited, order)
        return order

    def _dfs_recursive(self, node, visited, order):
        visited.add(node)
        order.append(node)
        for neighbour, _ in sorted(self.adjacency_list.get(node, [])):
            if neighbour not in visited:
                self._dfs_recursive(neighbour, visited, order)


# ══════════════════════════════════════════════════════════════════
#  MAIN RUNNER
# ══════════════════════════════════════════════════════════════════

def section(title):
    print()
    print("=" * 60)
    print(f"  {title}")
    print("=" * 60)


def run_bst():
    section("TASK 1 — Binary Search Tree (BST)")

    bst = BST()

    # ── Insert ──────────────────────────────────────────────────
    keys = [50, 30, 70, 20, 40, 60, 80]
    print(f"\n[1] Inserting keys: {keys}")
    for k in keys:
        bst.insert(k)
    print(f"    Inorder after inserts : {bst.inorder_traversal()}")

    # ── Search ──────────────────────────────────────────────────
    print("\n[2] Search operations:")
    for target in [20, 90]:
        result = bst.search(target)
        print(f"    search({target}) → {'Found ✓' if result else 'Not Found ✗'}")

    # ── Delete: Case 1 – Leaf node (20) ─────────────────────────
    print("\n[3] Delete leaf node: 20")
    bst.delete(20)
    print(f"    Inorder after deleting 20 : {bst.inorder_traversal()}")

    # ── Delete: Case 2 – One child (insert 65, delete 60) ───────
    print("\n[4] Insert 65, then delete 60 (one-child case):")
    bst.insert(65)
    print(f"    Inorder after inserting 65 : {bst.inorder_traversal()}")
    bst.delete(60)
    print(f"    Inorder after deleting  60 : {bst.inorder_traversal()}")

    # ── Delete: Case 3 – Two children (30) ──────────────────────
    print("\n[5] Delete node with two children: 30")
    bst.delete(30)
    print(f"    Inorder after deleting 30 : {bst.inorder_traversal()}")

    # ── Delete: Case 3 – Two children (50, root) ────────────────
    print("\n[6] Delete root node with two children: 50")
    bst.delete(50)
    print(f"    Inorder after deleting 50 : {bst.inorder_traversal()}")


def run_graph():
    section("TASK 2 — Graph: Adjacency List + BFS + DFS")

    g = Graph()

    # Build the graph from the assignment specification
    edges = [
        ('A', 'B', 2),
        ('A', 'C', 4),
        ('B', 'D', 7),
        ('B', 'E', 3),
        ('C', 'E', 1),
        ('C', 'F', 8),
        ('D', 'F', 5),
        ('E', 'D', 2),
        ('E', 'F', 6),
    ]

    for src, dst, w in edges:
        g.add_edge(src, dst, w)

    print()
    g.print_adjacency_list()

    print("\n[BFS from A]")
    bfs_order = g.bfs('A')
    print(f"  BFS traversal order : {' → '.join(bfs_order)}")

    print("\n[DFS from A]")
    dfs_order = g.dfs('A')
    print(f"  DFS traversal order : {' → '.join(dfs_order)}")


def main():
    output_file = open("output.txt", "w", encoding="utf-8")
    sys.stdout = Tee(sys.__stdout__, output_file)

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Lab Assignment-4: Trees & Graphs                       ║")
    print("║  Course: Basics of Data Structures (ETCCBD201)          ║")
    print("╚══════════════════════════════════════════════════════════╝")

    run_bst()
    run_graph()

    section("END OF OUTPUT")
    print()

    sys.stdout = sys.__stdout__
    output_file.close()
    print("\n[✓] Output also saved to output.txt")


if __name__ == "__main__":
    main()
