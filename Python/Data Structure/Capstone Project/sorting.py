"""
sorting.py — Sorting Algorithms Module
Social Network Explorer (SNE)

Implements two comparison-based sorting algorithms:
  1. Insertion Sort  — O(n²) time, O(1) space  (simple, good for small n)
  2. Merge Sort      — O(n log n) time, O(n) space  (efficient, stable)

Both accept an optional `key` callable (similar to Python's built-in
sorted()) so they can rank any list of objects by an extracted field.

The module also provides a `compare_sorts` helper that runs both
algorithms on the same input and prints timing information — fulfilling
the "compare at least two sorts" requirement from Unit–3.
"""

import time
import copy


# ─────────────────────────────────────────────────────────────────────────────
# 1. Insertion Sort
# ─────────────────────────────────────────────────────────────────────────────

def insertion_sort(arr: list, key=None, reverse: bool = False) -> list:
    """
    Sort `arr` in-place using Insertion Sort and return it.

    Parameters
    ----------
    arr     : list to sort (modified in place)
    key     : callable that extracts a comparison value from each element
    reverse : if True, sort in descending order

    Complexity
    ----------
    Best case  : O(n)    — already sorted
    Worst case : O(n²)   — reverse sorted
    Space      : O(1)    — in-place

    How it works
    ------------
    Maintains a sorted sub-list on the left.  Each new element is
    inserted into the correct position by shifting larger elements
    right — just like sorting playing cards by hand.
    """
    if key is None:
        key = lambda x: x

    result = arr[:]          # work on a copy; don't mutate caller's list
    n = len(result)

    for i in range(1, n):
        current = result[i]
        current_key = key(current)
        j = i - 1

        # Shift elements that are greater (or smaller if descending) one step right
        while j >= 0 and (
            (not reverse and key(result[j]) > current_key) or
            (reverse     and key(result[j]) < current_key)
        ):
            result[j + 1] = result[j]
            j -= 1

        result[j + 1] = current

    return result


# ─────────────────────────────────────────────────────────────────────────────
# 2. Merge Sort
# ─────────────────────────────────────────────────────────────────────────────

def merge_sort(arr: list, key=None, reverse: bool = False) -> list:
    """
    Return a new sorted list using Merge Sort (non-destructive).

    Parameters
    ----------
    arr     : list to sort
    key     : callable that extracts a comparison value from each element
    reverse : if True, sort in descending order

    Complexity
    ----------
    Best / Average / Worst : O(n log n)
    Space                  : O(n) — auxiliary arrays for merging

    How it works
    ------------
    Divide-and-conquer: recursively split the list in half until each
    sub-list has one element (trivially sorted), then merge pairs of
    sorted sub-lists back together by picking the smallest element at
    each step.
    """
    if key is None:
        key = lambda x: x

    def _merge(left: list, right: list) -> list:
        merged = []
        i = j = 0
        while i < len(left) and j < len(right):
            lk, rk = key(left[i]), key(right[j])
            if (not reverse and lk <= rk) or (reverse and lk >= rk):
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged

    def _sort(lst: list) -> list:
        if len(lst) <= 1:
            return lst
        mid = len(lst) // 2
        return _merge(_sort(lst[:mid]), _sort(lst[mid:]))

    return _sort(list(arr))   # non-destructive: operate on a copy


# ─────────────────────────────────────────────────────────────────────────────
# 3. Comparison utility
# ─────────────────────────────────────────────────────────────────────────────

def compare_sorts(arr: list, key=None, reverse: bool = False) -> dict:
    """
    Run both algorithms on `arr` and print a timing comparison.

    Returns a dict with keys 'insertion' and 'merge', each containing
    {'result': sorted_list, 'time_ms': float}.
    """
    print("\n" + "═" * 50)
    print("  Sorting Algorithm Comparison")
    print("═" * 50)
    print(f"  Input size  : {len(arr)} elements")
    print(f"  Order       : {'Descending' if reverse else 'Ascending'}")
    print("─" * 50)

    # Insertion Sort
    arr_copy = copy.deepcopy(arr)
    t0 = time.perf_counter()
    ins_result = insertion_sort(arr_copy, key=key, reverse=reverse)
    ins_time = (time.perf_counter() - t0) * 1000

    # Merge Sort
    arr_copy = copy.deepcopy(arr)
    t0 = time.perf_counter()
    mrg_result = merge_sort(arr_copy, key=key, reverse=reverse)
    mrg_time = (time.perf_counter() - t0) * 1000

    print(f"  Insertion Sort : {ins_time:.4f} ms  |  O(n²)")
    print(f"  Merge Sort     : {mrg_time:.4f} ms  |  O(n log n)")
    print("─" * 50)
    faster = "Merge Sort" if mrg_time < ins_time else "Insertion Sort"
    print(f"  Faster on this run: {faster}")
    print("  Note: for n < ~20, Insertion Sort can beat Merge Sort")
    print("        due to lower constant factors and no recursion overhead.")
    print("═" * 50 + "\n")

    return {
        "insertion": {"result": ins_result, "time_ms": ins_time},
        "merge":     {"result": mrg_result, "time_ms": mrg_time},
    }
