"""
profiles.py — User Profile Management Module
Social Network Explorer (SNE)

Uses a HashTable (Python dict internally) for O(1) average-case
add / get / update operations.  Each entry stores a structured
profile dict so the rest of the system can rely on a stable schema.
"""

# ---------------------------------------------------------------------------
# Profile schema helpers
# ---------------------------------------------------------------------------

def _make_profile(user_id: str, name: str, age: int,
                  interests: list, city: str = "",
                  profession: str = "", bio: str = "") -> dict:
    """Return a validated profile dictionary."""
    if not isinstance(age, int) or age < 0:
        raise ValueError(f"Age must be a non-negative integer, got {age!r}")
    return {
        "user_id":    user_id,
        "name":       name,
        "age":        age,
        "interests":  list(interests),   # copy so caller's list can't mutate
        "city":       city,
        "profession": profession,
        "bio":        bio,
    }


# ---------------------------------------------------------------------------
# HashTable class  (thin wrapper around dict — explains hashing conceptually)
# ---------------------------------------------------------------------------

class HashTable:
    """
    A hash-table for storing user profiles.

    Internally Python's built-in dict is used, which implements an
    open-addressing hash table with a load-factor resize strategy giving
    O(1) amortised complexity for insertions, look-ups and deletions.

    The key (user_id string) is hashed with Python's built-in hash()
    to determine the bucket index.  Collision resolution is handled
    transparently by the dict implementation (pseudo-random probing).

    Time complexities
    -----------------
    add_user        : O(1) amortised
    get_user_profile: O(1) amortised
    update_user     : O(1) amortised
    delete_user     : O(1) amortised
    list_all_users  : O(n)
    """

    def __init__(self):
        self._table: dict[str, dict] = {}   # hash-map: user_id → profile

    # ------------------------------------------------------------------ add
    def add_user(self, user_id: str, name: str, age: int,
                 interests: list, city: str = "",
                 profession: str = "", bio: str = "") -> bool:
        """
        Add a new user profile.

        Returns True on success, False if user_id already exists.
        """
        user_id = user_id.strip()
        if not user_id:
            print("[ERROR] user_id cannot be empty.")
            return False
        if user_id in self._table:
            print(f"[ERROR] User '{user_id}' already exists. Use update instead.")
            return False
        self._table[user_id] = _make_profile(
            user_id, name, age, interests, city, profession, bio
        )
        print(f"[OK] User '{user_id}' ({name}) added successfully.")
        return True

    # ----------------------------------------------------------------- get
    def get_user_profile(self, user_id: str) -> dict | None:
        """
        Retrieve a user profile by user_id.

        Returns the profile dict or None if not found.
        """
        profile = self._table.get(user_id)
        if profile is None:
            print(f"[ERROR] User '{user_id}' not found.")
        return profile

    # -------------------------------------------------------------- update
    def update_user_profile(self, user_id: str, **kwargs) -> bool:
        """
        Update one or more fields of an existing profile.

        Accepted keyword arguments: name, age, interests, city,
        profession, bio.  user_id itself cannot be changed.

        Returns True on success, False if user not found.
        """
        if user_id not in self._table:
            print(f"[ERROR] User '{user_id}' not found. Cannot update.")
            return False
        profile = self._table[user_id]
        allowed_fields = {"name", "age", "interests", "city", "profession", "bio"}
        for field, value in kwargs.items():
            if field not in allowed_fields:
                print(f"[WARN] Ignoring unknown field '{field}'.")
                continue
            if field == "age" and (not isinstance(value, int) or value < 0):
                print(f"[ERROR] Invalid age value: {value}")
                continue
            if field == "interests":
                profile[field] = list(value)
            else:
                profile[field] = value
        print(f"[OK] User '{user_id}' profile updated.")
        return True

    # -------------------------------------------------------------- delete
    def delete_user(self, user_id: str) -> bool:
        """Remove a user profile (used by graph cleanup as well)."""
        if user_id not in self._table:
            print(f"[ERROR] User '{user_id}' not found. Cannot delete.")
            return False
        del self._table[user_id]
        print(f"[OK] User '{user_id}' deleted.")
        return True

    # --------------------------------------------------------------- list
    def list_all_users(self) -> list[str]:
        """Return sorted list of all user_ids."""
        return sorted(self._table.keys())

    # -------------------------------------------------------------- exists
    def user_exists(self, user_id: str) -> bool:
        return user_id in self._table

    # ------------------------------------------------------------- display
    def display_profile(self, user_id: str) -> None:
        """Pretty-print a single user's profile."""
        profile = self.get_user_profile(user_id)
        if profile is None:
            return
        interests_str = ", ".join(profile["interests"]) if profile["interests"] else "—"
        print("\n" + "─" * 40)
        print(f"  User ID    : {profile['user_id']}")
        print(f"  Name       : {profile['name']}")
        print(f"  Age        : {profile['age']}")
        print(f"  Interests  : {interests_str}")
        if profile.get("city"):
            print(f"  City       : {profile['city']}")
        if profile.get("profession"):
            print(f"  Profession : {profile['profession']}")
        if profile.get("bio"):
            print(f"  Bio        : {profile['bio']}")
        print("─" * 40)

    def display_all_profiles(self) -> None:
        """Pretty-print every profile in sorted user_id order."""
        if not self._table:
            print("[INFO] No users in the system.")
            return
        for uid in self.list_all_users():
            self.display_profile(uid)

    def __len__(self) -> int:
        return len(self._table)

    def __repr__(self) -> str:
        return f"HashTable({len(self._table)} users)"
