"""
network_graph.py — Friendship / Follower Network Module
Social Network Explorer (SNE)

Represents the social graph as an adjacency list:
    graph[user_id] = [list of connected user_ids]

Supports both bidirectional friendships (undirected) and
unidirectional follows (directed) — controlled by the `directed`
flag passed to SocialGraph.__init__.

Space complexity : O(V + E)   where V = users, E = connections
Time complexities
-----------------
add_friendship    : O(1)
remove_friendship : O(degree of node)  — linear scan to delete
get_friends       : O(1)
has_connection    : O(degree of node)
"""

from profiles import HashTable


class SocialGraph:
    """
    Adjacency-list social graph.

    Parameters
    ----------
    profile_store : HashTable
        Reference to the shared user store — used for existence checks
        and to remove a node's row when a user is deleted.
    directed : bool
        False  → undirected (mutual friendships, default)
        True   → directed   (follower/following model)
    """

    def __init__(self, profile_store: HashTable, directed: bool = False):
        self._adj: dict[str, list[str]] = {}   # adjacency list
        self._store = profile_store
        self._directed = directed

    # ---------------------------------------------------------------- internal
    def _ensure_node(self, user_id: str) -> None:
        """Create an adjacency entry for user_id if absent."""
        if user_id not in self._adj:
            self._adj[user_id] = []

    # --------------------------------------------------------- add friendship
    def add_friendship(self, user1: str, user2: str) -> bool:
        """
        Add a connection between user1 and user2.

        Bidirectional when self._directed is False (default).
        Returns True on success, False on validation failure.
        """
        if user1 == user2:
            print("[ERROR] A user cannot be friends with themselves.")
            return False
        if not self._store.user_exists(user1):
            print(f"[ERROR] User '{user1}' does not exist in the system.")
            return False
        if not self._store.user_exists(user2):
            print(f"[ERROR] User '{user2}' does not exist in the system.")
            return False

        self._ensure_node(user1)
        self._ensure_node(user2)

        if self.has_connection(user1, user2):
            print(f"[INFO] Connection between '{user1}' and '{user2}' already exists.")
            return False

        self._adj[user1].append(user2)
        if not self._directed:
            self._adj[user2].append(user1)

        rel = "follows" if self._directed else "friends with"
        print(f"[OK] '{user1}' is now {rel} '{user2}'.")
        return True

    # ------------------------------------------------------ remove friendship
    def remove_friendship(self, user1: str, user2: str) -> bool:
        """
        Remove the connection between user1 and user2.

        Returns True on success, False if connection does not exist.
        """
        if not self.has_connection(user1, user2):
            print(f"[ERROR] No connection found between '{user1}' and '{user2}'.")
            return False

        self._adj[user1] = [u for u in self._adj[user1] if u != user2]
        if not self._directed:
            self._adj[user2] = [u for u in self._adj[user2] if u != user1]

        print(f"[OK] Connection between '{user1}' and '{user2}' removed.")
        return True

    # -------------------------------------------------------- get friends
    def get_friends(self, user_id: str) -> list[str]:
        """
        Return the list of users connected to user_id.

        Returns an empty list if the user has no connections or
        does not exist in the graph.
        """
        if not self._store.user_exists(user_id):
            print(f"[ERROR] User '{user_id}' does not exist.")
            return []
        return list(self._adj.get(user_id, []))

    # ----------------------------------------------------- has_connection
    def has_connection(self, user1: str, user2: str) -> bool:
        """Return True if there is a directed edge from user1 → user2."""
        return user2 in self._adj.get(user1, [])

    # ----------------------------------------------------- remove_user_node
    def remove_user_node(self, user_id: str) -> None:
        """
        Remove a user's node and all edges referencing it.
        Called when a user is deleted from the system.
        """
        self._adj.pop(user_id, None)
        for uid in self._adj:
            self._adj[uid] = [u for u in self._adj[uid] if u != user_id]

    # --------------------------------------------------------- display
    def display_connections(self, user_id: str) -> None:
        """Pretty-print connections for a given user."""
        if not self._store.user_exists(user_id):
            print(f"[ERROR] User '{user_id}' not found.")
            return
        friends = self.get_friends(user_id)
        profile = self._store.get_user_profile(user_id)
        name = profile["name"] if profile else user_id
        label = "Following" if self._directed else "Friends"
        print(f"\n{label} of {name} ({user_id}):")
        if not friends:
            print("  (no connections yet)")
        else:
            for i, fid in enumerate(friends, 1):
                fp = self._store.get_user_profile(fid)
                fname = fp["name"] if fp else fid
                print(f"  {i}. {fname} ({fid})")

    def display_all_connections(self) -> None:
        """Print the full adjacency list (debug/overview)."""
        print("\n=== Adjacency List ===")
        if not self._adj:
            print("  (empty graph)")
            return
        for uid in sorted(self._adj):
            print(f"  {uid}: {self._adj[uid]}")

    # --------------------------------------------------------- properties
    @property
    def adjacency(self) -> dict[str, list[str]]:
        """Read-only view of the internal adjacency list."""
        return self._adj

    @property
    def all_nodes(self) -> list[str]:
        """All user IDs currently in the graph."""
        return list(self._adj.keys())

    def edge_count(self) -> int:
        total = sum(len(v) for v in self._adj.values())
        return total if self._directed else total // 2

    def __repr__(self) -> str:
        mode = "Directed" if self._directed else "Undirected"
        return (f"SocialGraph({mode}, nodes={len(self._adj)}, "
                f"edges={self.edge_count()})")
