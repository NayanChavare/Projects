"""
algorithms.py — Graph Algorithm Module
Social Network Explorer (SNE)

Implements:
  1. BFS Shortest Path   — minimum degrees of separation between two users
  2. DFS Friends-of-Friends — all reachable users within depth k
  3. Friend Suggestion   — common-interest scoring + sorting
  4. Mutual Friends      — set intersection helper

All functions receive the raw adjacency dict and the profile HashTable
so they remain decoupled from the SocialGraph class.

Complexity Notes
----------------
BFS  : O(V + E)  — visits each node and edge at most once
DFS  : O(V + E)  — same, bounded by depth limit
Suggestion scoring  : O(U * I)  where I = max interests per user
Sorting suggestions : O(n log n)  via Merge Sort (see sorting.py)
"""

from collections import deque
from profiles import HashTable
from sorting import merge_sort, compare_sorts


# ─────────────────────────────────────────────────────────────────────────────
# 1. BFS — Shortest Path
# ─────────────────────────────────────────────────────────────────────────────

def bfs_shortest_path(adj: dict, start: str, end: str,
                      profile_store: HashTable) -> list[str]:
    """
    Find the shortest path from `start` to `end` using BFS.

    Returns a list of user_ids representing the path, e.g.
        ["u1", "u3", "u5"]
    Returns an empty list if no path exists.

    Parameters
    ----------
    adj           : adjacency dict  { user_id: [neighbour_ids] }
    start / end   : user_ids to connect
    profile_store : used for existence checks and name look-ups
    """
    # --- validation ---
    for uid in (start, end):
        if not profile_store.user_exists(uid):
            print(f"[ERROR] User '{uid}' not found.")
            return []
    if start == end:
        print("[INFO] Start and end are the same user.")
        return [start]

    # --- BFS ---
    visited = {start}
    # Queue stores (current_node, path_so_far)
    queue = deque([(start, [start])])

    while queue:
        current, path = queue.popleft()

        for neighbour in adj.get(current, []):
            if neighbour == end:
                return path + [neighbour]          # found!
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append((neighbour, path + [neighbour]))

    return []   # no path exists


def print_bfs_result(path: list[str], start: str, end: str,
                     profile_store: HashTable) -> None:
    """Pretty-print the result of a BFS query."""
    def name(uid):
        p = profile_store.get_user_profile(uid)
        return p["name"] if p else uid

    print(f"\n  BFS: Shortest path from '{name(start)}' → '{name(end)}'")
    if not path:
        print("  No connection found between these users.")
        return
    degrees = len(path) - 1
    path_str = " → ".join(f"{name(u)} ({u})" for u in path)
    print(f"  Path    : {path_str}")
    print(f"  Degrees : {degrees} degree(s) of separation")


# ─────────────────────────────────────────────────────────────────────────────
# 2. DFS — Friends-of-Friends (Depth-Limited)
# ─────────────────────────────────────────────────────────────────────────────

def dfs_friends_of_friends(adj: dict, start: str, max_depth: int,
                            profile_store: HashTable) -> list[str]:
    """
    Discover all users reachable from `start` within `max_depth` hops.

    Uses iterative DFS with an explicit stack (avoids recursion limit
    issues for large graphs).  The start user is excluded from results.

    Returns a list of reachable user_ids (order: DFS traversal order).

    Complexity : O(V + E) bounded by the subgraph reachable within depth.
    """
    if not profile_store.user_exists(start):
        print(f"[ERROR] User '{start}' not found.")
        return []

    # Stack entries: (node, depth_level)
    stack: list[tuple[str, int]] = [(start, 0)]
    visited: set[str] = {start}
    reachable: list[str] = []

    while stack:
        current, depth = stack.pop()

        if depth < max_depth:
            for neighbour in adj.get(current, []):
                if neighbour not in visited:
                    visited.add(neighbour)
                    reachable.append(neighbour)
                    stack.append((neighbour, depth + 1))

    return reachable


def print_dfs_result(reachable: list[str], start: str, depth: int,
                     profile_store: HashTable) -> None:
    """Pretty-print the result of a DFS depth search."""
    def name(uid):
        p = profile_store.get_user_profile(uid)
        return p["name"] if p else uid

    sp = profile_store.get_user_profile(start)
    sname = sp["name"] if sp else start
    print(f"\n  DFS: Friends-of-friends of '{sname}' up to depth {depth}")
    if not reachable:
        print("  No users found within this depth.")
        return
    for i, uid in enumerate(reachable, 1):
        print(f"  {i:>2}. {name(uid)} ({uid})")
    print(f"  Total reachable: {len(reachable)} user(s)")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Friend Suggestion  (Common-Interest Scoring + Sorting)
# ─────────────────────────────────────────────────────────────────────────────

def compute_common_interests(interests_a: list, interests_b: list) -> int:
    """Return the count of shared interests between two lists."""
    return len(set(interests_a) & set(interests_b))


def get_friend_suggestions(user_id: str, adj: dict,
                            profile_store: HashTable,
                            top_n: int = 5) -> list[dict]:
    """
    Recommend up to `top_n` users not already connected to `user_id`.

    Scoring
    -------
    score = number of interests in common with the target user.

    Sorting
    -------
    Uses Merge Sort (from sorting.py) to rank candidates by score
    in descending order — satisfies Unit-3 sorting requirement.

    Returns a list of dicts:
        [{"user_id": ..., "name": ..., "score": ..., "common": [...]}, ...]
    """
    if not profile_store.user_exists(user_id):
        print(f"[ERROR] User '{user_id}' not found.")
        return []

    target = profile_store.get_user_profile(user_id)
    target_interests = set(target["interests"])
    existing_friends = set(adj.get(user_id, []))
    existing_friends.add(user_id)   # exclude self

    candidates = []
    for uid in profile_store.list_all_users():
        if uid in existing_friends:
            continue
        p = profile_store.get_user_profile(uid)
        if p is None:
            continue
        common = target_interests & set(p["interests"])
        candidates.append({
            "user_id": uid,
            "name":    p["name"],
            "score":   len(common),
            "common":  sorted(common),
        })

    # Sort by score descending using Merge Sort
    sorted_candidates = merge_sort(candidates, key=lambda x: x["score"],
                                   reverse=True)
    return sorted_candidates[:top_n]


def print_suggestions(suggestions: list[dict], user_id: str,
                      profile_store: HashTable) -> None:
    """Pretty-print friend suggestions."""
    p = profile_store.get_user_profile(user_id)
    uname = p["name"] if p else user_id
    print(f"\n  Friend Suggestions for '{uname}' ({user_id}):")
    if not suggestions:
        print("  No suggestions available.")
        return
    print(f"  {'#':<4} {'Name':<20} {'ID':<12} {'Common Interests'}")
    print("  " + "─" * 60)
    for i, s in enumerate(suggestions, 1):
        common_str = ", ".join(s["common"]) if s["common"] else "(none)"
        print(f"  {i:<4} {s['name']:<20} {s['user_id']:<12} "
              f"[score={s['score']}] {common_str}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. Mutual Friends helper
# ─────────────────────────────────────────────────────────────────────────────

def mutual_friends(user1: str, user2: str, adj: dict) -> list[str]:
    """Return the list of user_ids that are friends with both user1 and user2."""
    f1 = set(adj.get(user1, []))
    f2 = set(adj.get(user2, []))
    return sorted(f1 & f2)
