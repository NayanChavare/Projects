"""
main.py — Social Network Explorer (SNE)
CLI Application Runner

Course  : Basics of Data Structures (ETCCBD201)
Project : Final Capstone Assignment

Provides:
  • Interactive CLI menu with 10 options
  • Auto-runnable demo mode (--demo flag or menu option 0)

Run normally : python main.py
Run demo mode: python main.py --demo
"""

import sys
from profiles      import HashTable
from network_graph import SocialGraph
from algorithms    import (bfs_shortest_path, print_bfs_result,
                           dfs_friends_of_friends, print_dfs_result,
                           get_friend_suggestions, print_suggestions,
                           mutual_friends)
from sorting       import compare_sorts


# ─────────────────────────────────────────────────────────────────────────────
# Shared state (module-level singletons)
# ─────────────────────────────────────────────────────────────────────────────
store = HashTable()          # user profiles (hashing)
graph = SocialGraph(store)   # friendship graph (adjacency list)


# ─────────────────────────────────────────────────────────────────────────────
# Demo Dataset
# ─────────────────────────────────────────────────────────────────────────────

def load_demo_data() -> None:
    """
    Populate 8 sample users, 10 connections, and run all required queries.
    This satisfies the 'Required Demo Dataset' section of the assignment.
    """
    banner("DEMO MODE — Auto-loading sample dataset")

    # ── 8 sample users ──────────────────────────────────────────────────────
    users = [
        ("u1", "Alice",   21, ["music", "travel", "tech"],      "Delhi",     "Engineer"),
        ("u2", "Bob",     23, ["sports", "travel", "gaming"],   "Mumbai",    "Designer"),
        ("u3", "Carol",   22, ["tech", "AI", "music"],          "Bangalore", "Data Scientist"),
        ("u4", "Dave",    25, ["gaming", "movies", "sports"],   "Pune",      "Developer"),
        ("u5", "Eve",     20, ["travel", "music", "AI"],        "Delhi",     "Student"),
        ("u6", "Frank",   24, ["AI", "tech", "coding"],         "Hyderabad", "ML Engineer"),
        ("u7", "Grace",   22, ["movies", "music", "travel"],    "Chennai",   "Artist"),
        ("u8", "Heidi",   26, ["sports", "cooking", "gaming"],  "Kolkata",   "Chef"),
    ]
    print("\n>>> Adding 8 users")
    for uid, name, age, interests, city, profession in users:
        store.add_user(uid, name, age, interests, city=city, profession=profession)

    # ── 2 profile updates ───────────────────────────────────────────────────
    print("\n>>> Updating 2 profiles")
    store.update_user_profile("u1", bio="Loves hiking on weekends.",
                              interests=["music", "travel", "tech", "AI"])
    store.update_user_profile("u4", city="Goa", profession="Game Developer")

    # ── Display 3 profiles ──────────────────────────────────────────────────
    print("\n>>> Displaying 3 profiles")
    for uid in ["u1", "u3", "u6"]:
        store.display_profile(uid)

    # ── 10 friendships ──────────────────────────────────────────────────────
    connections = [
        ("u1", "u2"), ("u1", "u3"), ("u2", "u4"),
        ("u3", "u5"), ("u3", "u6"), ("u4", "u7"),
        ("u5", "u6"), ("u5", "u8"), ("u6", "u7"),
        ("u7", "u8"),
    ]
    print("\n>>> Creating 10 friendship connections")
    for a, b in connections:
        graph.add_friendship(a, b)

    # ── Remove 1 connection ─────────────────────────────────────────────────
    print("\n>>> Removing 1 connection (u4 — u7)")
    graph.remove_friendship("u4", "u7")

    # ── Show friends of 2 users ─────────────────────────────────────────────
    print("\n>>> Printing friend lists")
    graph.display_connections("u1")
    graph.display_connections("u5")

    # ── BFS shortest path queries ───────────────────────────────────────────
    banner("BFS: Shortest Path Queries")
    for start, end in [("u1", "u8"), ("u2", "u6")]:
        path = bfs_shortest_path(graph.adjacency, start, end, store)
        print_bfs_result(path, start, end, store)

    # ── DFS depth search ────────────────────────────────────────────────────
    banner("DFS: Friends-of-Friends Depth Search")
    for depth in [2, 3]:
        reachable = dfs_friends_of_friends(graph.adjacency, "u1", depth, store)
        print_dfs_result(reachable, "u1", depth, store)

    # ── Friend suggestions ──────────────────────────────────────────────────
    banner("Friend Suggestions (sorted by common interests)")
    suggestions = get_friend_suggestions("u1", graph.adjacency, store, top_n=5)
    print_suggestions(suggestions, "u1", store)

    # ── Sorting comparison ──────────────────────────────────────────────────
    banner("Sorting Algorithm Comparison — Unit 3")
    all_uids = store.list_all_users()
    items = []
    for uid in all_uids:
        p = store.get_user_profile(uid)
        if p:
            items.append({"user_id": uid, "name": p["name"],
                          "age": p["age"], "n_interests": len(p["interests"])})
    compare_sorts(items, key=lambda x: x["n_interests"], reverse=True)

    banner("Demo Complete ✓")


# ─────────────────────────────────────────────────────────────────────────────
# CLI helpers
# ─────────────────────────────────────────────────────────────────────────────

def banner(title: str) -> None:
    print(f"\n{'═' * 55}")
    print(f"  {title}")
    print(f"{'═' * 55}")


def prompt(msg: str) -> str:
    return input(f"  {msg}: ").strip()


def prompt_int(msg: str, default: int = 0) -> int:
    try:
        return int(prompt(msg))
    except ValueError:
        return default


def prompt_list(msg: str) -> list[str]:
    raw = prompt(msg)
    return [x.strip() for x in raw.split(",") if x.strip()]


# ─────────────────────────────────────────────────────────────────────────────
# Menu actions
# ─────────────────────────────────────────────────────────────────────────────

def menu_add_user() -> None:
    banner("Add New User")
    uid         = prompt("User ID (unique)")
    name        = prompt("Full Name")
    age         = prompt_int("Age")
    interests   = prompt_list("Interests (comma-separated)")
    city        = prompt("City (optional)")
    profession  = prompt("Profession (optional)")
    bio         = prompt("Bio (optional)")
    store.add_user(uid, name, age, interests, city=city,
                   profession=profession, bio=bio)


def menu_view_profile() -> None:
    banner("View User Profile")
    uid = prompt("User ID")
    store.display_profile(uid)


def menu_update_profile() -> None:
    banner("Update User Profile")
    uid = prompt("User ID to update")
    if not store.user_exists(uid):
        print(f"[ERROR] User '{uid}' not found.")
        return
    print("  Leave field blank to keep current value.")
    fields = {}
    name = prompt("New name")
    if name:
        fields["name"] = name
    age_str = prompt("New age")
    if age_str.isdigit():
        fields["age"] = int(age_str)
    interests_raw = prompt("New interests (comma-separated)")
    if interests_raw:
        fields["interests"] = [x.strip() for x in interests_raw.split(",")]
    city = prompt("New city")
    if city:
        fields["city"] = city
    profession = prompt("New profession")
    if profession:
        fields["profession"] = profession
    bio = prompt("New bio")
    if bio:
        fields["bio"] = bio
    if fields:
        store.update_user_profile(uid, **fields)
    else:
        print("[INFO] No changes entered.")


def menu_add_friendship() -> None:
    banner("Add Friendship")
    u1 = prompt("User ID 1")
    u2 = prompt("User ID 2")
    graph.add_friendship(u1, u2)


def menu_remove_friendship() -> None:
    banner("Remove Friendship")
    u1 = prompt("User ID 1")
    u2 = prompt("User ID 2")
    graph.remove_friendship(u1, u2)


def menu_show_connections() -> None:
    banner("Show Connections of a User")
    uid = prompt("User ID")
    graph.display_connections(uid)


def menu_bfs() -> None:
    banner("Shortest Path — BFS")
    start = prompt("Start User ID")
    end   = prompt("End User ID")
    path  = bfs_shortest_path(graph.adjacency, start, end, store)
    print_bfs_result(path, start, end, store)


def menu_dfs() -> None:
    banner("Friends-of-Friends — DFS")
    start = prompt("Start User ID")
    depth = prompt_int("Max Depth (e.g. 2 or 3)", default=2)
    reachable = dfs_friends_of_friends(graph.adjacency, start, depth, store)
    print_dfs_result(reachable, start, depth, store)


def menu_suggestions() -> None:
    banner("Friend Suggestions")
    uid    = prompt("User ID")
    top_n  = prompt_int("How many suggestions? (default 5)", default=5)
    if top_n <= 0:
        top_n = 5
    suggestions = get_friend_suggestions(uid, graph.adjacency, store, top_n=top_n)
    print_suggestions(suggestions, uid, store)


def menu_list_all() -> None:
    banner("All Users")
    uids = store.list_all_users()
    if not uids:
        print("  No users in the system.")
    for uid in uids:
        p = store.get_user_profile(uid)
        if p:
            print(f"  {uid:<12} {p['name']:<20} Age: {p['age']}")


def menu_mutual_friends() -> None:
    banner("Mutual Friends")
    u1 = prompt("User ID 1")
    u2 = prompt("User ID 2")
    mutuals = mutual_friends(u1, u2, graph.adjacency)
    print(f"\n  Mutual friends of '{u1}' and '{u2}':")
    if not mutuals:
        print("  (none)")
    else:
        for uid in mutuals:
            p = store.get_user_profile(uid)
            name = p["name"] if p else uid
            print(f"  • {name} ({uid})")


def menu_sorting_demo() -> None:
    banner("Sorting Algorithm Comparison")
    uids = store.list_all_users()
    if not uids:
        print("  Add users first.")
        return
    items = []
    for uid in uids:
        p = store.get_user_profile(uid)
        if p:
            items.append({"user_id": uid, "name": p["name"],
                          "n_interests": len(p["interests"])})
    compare_sorts(items, key=lambda x: x["n_interests"], reverse=True)


# ─────────────────────────────────────────────────────────────────────────────
# Main menu loop
# ─────────────────────────────────────────────────────────────────────────────

MENU = """
╔══════════════════════════════════════════════╗
║      Social Network Explorer (SNE)           ║
║      Basics of Data Structures — ETCCBD201   ║
╠══════════════════════════════════════════════╣
║  1.  Add User                                ║
║  2.  View User Profile                       ║
║  3.  Update User Profile                     ║
║  4.  Add Friendship / Follow                 ║
║  5.  Remove Friendship / Follow              ║
║  6.  Show Connections of a User              ║
║  7.  Shortest Path (BFS)                     ║
║  8.  Friends-of-Friends (DFS Depth)          ║
║  9.  Friend Suggestions (Sorted)             ║
║  10. List All Users                          ║
║  11. Mutual Friends                          ║
║  12. Sorting Algorithm Comparison            ║
║  0.  Run Demo Mode                           ║
║  99. Exit                                    ║
╚══════════════════════════════════════════════╝"""

ACTIONS = {
    "1":  menu_add_user,
    "2":  menu_view_profile,
    "3":  menu_update_profile,
    "4":  menu_add_friendship,
    "5":  menu_remove_friendship,
    "6":  menu_show_connections,
    "7":  menu_bfs,
    "8":  menu_dfs,
    "9":  menu_suggestions,
    "10": menu_list_all,
    "11": menu_mutual_friends,
    "12": menu_sorting_demo,
    "0":  load_demo_data,
}


def main() -> None:
    if "--demo" in sys.argv:
        load_demo_data()
        return

    while True:
        print(MENU)
        choice = input("  Enter option: ").strip()
        if choice == "99":
            print("\n  Goodbye! 👋\n")
            break
        action = ACTIONS.get(choice)
        if action:
            action()
        else:
            print("[ERROR] Invalid option. Please choose from the menu.")


if __name__ == "__main__":
    main()
