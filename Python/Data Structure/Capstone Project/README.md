# Social Network Explorer (SNE)
### Final Capstone — Basics of Data Structures (ETCCBD201)
**School of Engineering & Technology | B.Sc (H) CS/DS/Cyber Sec**

---

## Project Overview

The **Social Network Explorer** is a command-line Python application that simulates core features of real social platforms (LinkedIn / Instagram). It demonstrates every data structure and algorithm taught across all four units of the course.

| Unit | Concepts Used |
|------|--------------|
| Unit 1 | Algorithm analysis (Big-O), ADT design, recursion (DFS) |
| Unit 2 | Arrays/Lists (interests, adjacency), Queue (BFS), Stack (DFS iterative) |
| Unit 3 | Insertion Sort & Merge Sort (friend ranking), sort comparison |
| Unit 4 | Hash Table (profiles), Graph/Adjacency List, BFS, DFS |

---

## Project Structure

```
Capstone Project/
│
├── main.py          ← CLI menu + auto-runnable demo mode
├── profiles.py      ← HashTable for user profile management
├── network_graph.py ← Social graph (adjacency list)
├── algorithms.py    ← BFS, DFS, friend suggestions
├── sorting.py       ← Insertion Sort & Merge Sort with comparison
│
├── output.txt       ← Full demo run output
├── README.md        ← This file
└── report.pdf       ← Design report (4-6 pages)
```

---

## How to Run

### Requirements
- Python 3.10 or higher (uses `match`, `dict | None` type hints)
- No external libraries needed — pure standard library

### Run Demo Mode (evaluator friendly)
```bash
python main.py --demo
```
This automatically:
- Inserts 8 sample users with interests
- Updates 2 profiles
- Creates 10 friendships, removes 1
- Runs 2 BFS shortest-path queries
- Runs DFS at depth 2 and depth 3
- Prints top-5 friend suggestions (sorted by common interests)
- Compares Insertion Sort vs Merge Sort performance

### Run Interactive CLI
```bash
python main.py
```

---

## CLI Menu Options

```
 1.  Add User
 2.  View User Profile
 3.  Update User Profile
 4.  Add Friendship / Follow
 5.  Remove Friendship / Follow
 6.  Show Connections of a User
 7.  Shortest Path (BFS)
 8.  Friends-of-Friends (DFS Depth)
 9.  Friend Suggestions (Sorted)
10.  List All Users
11.  Mutual Friends
12.  Sorting Algorithm Comparison
 0.  Run Demo Mode
99.  Exit
```

---

## Data Structures & Complexity

### User Profile Management — `profiles.py`
Stores profiles in a **HashTable** (Python `dict` — open-addressing with pseudo-random probing).

| Operation | Complexity |
|-----------|-----------|
| `add_user` | O(1) amortised |
| `get_user_profile` | O(1) amortised |
| `update_user_profile` | O(1) amortised |
| `list_all_users` | O(n) |

### Friendship Graph — `network_graph.py`
Undirected graph represented as an **adjacency list**.

- Space: **O(V + E)**
- `add_friendship` / `get_friends`: **O(1)**
- `remove_friendship`: **O(degree)** — linear scan on the neighbour list

### BFS Shortest Path — `algorithms.py`
Uses a `collections.deque` as the queue. Tracks visited nodes to prevent cycles.

- Time: **O(V + E)**
- Returns the exact path as a list, or empty list if no path exists.

### DFS Friends-of-Friends — `algorithms.py`
Iterative DFS with an explicit stack and a depth counter. Bounded by `max_depth`.

- Time: **O(V + E)** bounded to the reachable subgraph

### Sorting — `sorting.py`
Two sorting algorithms implemented from scratch (no `sorted()` / `.sort()` used):

| Algorithm | Time (Best) | Time (Worst) | Space |
|-----------|-------------|--------------|-------|
| Insertion Sort | O(n) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n) |

Friend suggestions are ranked by **common interest score** (descending) using **Merge Sort**.

---

## Conceptual Notes — Recommendation System

### How hashing groups users by interests
A secondary hash map `interest → [user_ids]` can be built in O(n·I) time (n = users, I = interests per user). For any query user, we look up their interests and immediately get candidate lists — O(1) per interest bucket — instead of scanning all users.

### Computing common interests
For each candidate, we compute `len(set(target_interests) & set(candidate_interests))`. Set intersection is O(min(|A|, |B|)) using hash sets.

### Sorting candidates
Once scored, candidates are sorted by score descending. Merge Sort guarantees O(n log n) regardless of input distribution — essential for consistent recommendation latency in production systems with thousands of candidates.

---

## Sample Output

See `output.txt` for the complete demo run. Key results:

```
BFS: Shortest path from 'Alice' → 'Heidi'
  Path    : Alice (u1) → Carol (u3) → Eve (u5) → Heidi (u8)
  Degrees : 3 degree(s) of separation

DFS: Friends-of-friends of 'Alice' up to depth 2 → 5 users found
DFS: Friends-of-friends of 'Alice' up to depth 3 → 7 users found

Friend Suggestions for Alice:
  1. Eve    [score=3]  AI, music, travel
  2. Frank  [score=2]  AI, tech
  3. Grace  [score=2]  music, travel
```

---

## Academic Integrity
All code and explanations are original work produced for ETCCBD201.  
No external libraries beyond Python's standard library were used.

---
*End of README*
