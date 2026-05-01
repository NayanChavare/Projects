# Lab Assignment-4: Trees & Graphs 🌲

**Course:** Basics of Data Structures (ETCCBD201)  
**Unit:** Trees & Graphs  
**School:** School of Engineering & Technology  

---

## 📁 Repository Structure

```
Lab 4/
├── dmmt_toolkit.py   # Complete Python solution (BST + Graph)
├── output.txt        # Console output for all test cases
├── report.pdf        # Short explanation + complexity analysis
└── README.md         # This file
```

---

## 🚀 How to Run

```bash
python dmmt_toolkit.py
```

> Output is printed to the console **and** saved to `output.txt` automatically.

No external libraries required — uses only Python standard library (`collections.deque`).

---

## ✅ What's Implemented

### Task 1 — Binary Search Tree (BST)

| Method | Description |
|---|---|
| `insert(key)` | Inserts a key into the BST |
| `search(key)` | Returns `True` if key exists, `False` otherwise |
| `delete(key)` | Deletes a key — handles all 3 cases |
| `inorder_traversal()` | Returns keys in sorted (ascending) order |

**Delete handles all 3 cases:**
- **Case 1** – Leaf node (no children): simply removed
- **Case 2** – One child: replaced by its only child
- **Case 3** – Two children: replaced by in-order successor (smallest in right subtree)

**Required Test Plan:**
- Insert: `[50, 30, 70, 20, 40, 60, 80]`
- Search: `20` (found), `90` (not found)
- Delete `20` → Case 1 (leaf)
- Insert `65`, Delete `60` → Case 2 (one child)
- Delete `30` → Case 2 (one child, since 20 was already removed)
- Delete `50` → Case 3 (two children, replaced by in-order successor `65`)

---

### Task 2 — Graph (Adjacency List) + BFS + DFS

**Graph** (directed, weighted — 6 nodes, 9 edges):

```
A→B(2), A→C(4), B→D(7), B→E(3), C→E(1), C→F(8), D→F(5), E→D(2), E→F(6)
```

| Method | Description |
|---|---|
| `add_node(node)` | Adds a node to the graph |
| `add_edge(src, dst, weight)` | Adds a directed weighted edge |
| `print_adjacency_list()` | Displays the adjacency list |
| `bfs(start)` | BFS traversal using a queue (`deque`) |
| `dfs(start)` | DFS traversal using recursion |

**BFS from A:** `A → B → C → D → E → F`  
**DFS from A:** `A → B → D → F → E → C`

---

## 🧠 Key Concepts

**Why inorder traversal prints BST in sorted order:**  
BST property guarantees all left subtree keys < root < all right subtree keys. Inorder visits left → root → right, so it naturally produces ascending order.

**Time Complexity — BST:**  
| Operation | Average | Worst (skewed) |
|---|---|---|
| Insert | O(log n) | O(n) |
| Search | O(log n) | O(n) |
| Delete | O(log n) | O(n) |

**BFS vs DFS:**  
- **BFS** explores level by level (uses a queue). Best for shortest path in unweighted graphs.  
- **DFS** explores depth-first (uses recursion/stack). Best for cycle detection, topological sort.

---

