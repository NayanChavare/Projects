import random
import sys
import time

# Increase recursion limit for Quick Sort on worst-case inputs (sorted/reverse sorted arrays)
sys.setrecursionlimit(20000)

# ==========================================
# Task 1: Core Sorting Algorithms
# ==========================================


def insertion_sort(arr):
    """Sorts the list in non-decreasing order using Insertion Sort."""
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key


def merge(left, right):
    """Helper function to merge two sorted arrays."""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def merge_sort(arr):
    """Sorts the list using Merge Sort."""
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    # Copy sorted elements back into original array for in-place modification feel
    # (though merge sort inherently uses extra space)
    sorted_arr = merge(left, right)
    for i in range(len(arr)):
        arr[i] = sorted_arr[i]
    return arr


def partition(arr, low, high):
    """Lomuto partition scheme using the last element as pivot."""
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1


def quick_sort(arr, low, high):
    """Sorts the list using Quick Sort."""
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)


# ==========================================
# Task 2: Performance Measurement Utility
# ==========================================


def measure_time(sort_func, arr):
    """Makes a copy of the list and measures execution time in milliseconds."""
    arr_copy = arr.copy()
    start_time = time.perf_counter()

    if sort_func.__name__ == "quick_sort":
        sort_func(arr_copy, 0, len(arr_copy) - 1)
    else:
        sort_func(arr_copy)

    end_time = time.perf_counter()
    return (end_time - start_time) * 1000  # Convert seconds to milliseconds


# ==========================================
# Main Execution and Dataset Generator
# ==========================================


def main():
    # Correctness Check
    print("--- Correctness Check ---")
    test_arr = [5, 2, 9, 1, 5, 6]

    arr1 = test_arr.copy()
    insertion_sort(arr1)
    print(f"Insertion Sort: {arr1}")

    arr2 = test_arr.copy()
    merge_sort(arr2)
    print(f"Merge Sort:     {arr2}")

    arr3 = test_arr.copy()
    quick_sort(arr3, 0, len(arr3) - 1)
    print(f"Quick Sort:     {arr3}")
    print("\n")

    # Dataset Generation Parameters
    sizes = [1000, 5000, 10000]
    algorithms = [
        ("Insertion Sort", insertion_sort),
        ("Merge Sort", merge_sort),
        ("Quick Sort", quick_sort),
    ]

    print(
        f"{'Dataset Type':<15} | {'Size':<6} | {'Insertion Sort (ms)':<20} | {'Merge Sort (ms)':<15} | {'Quick Sort (ms)':<15}"
    )
    print("-" * 80)

    for size in sizes:
        # Generate Datasets
        random_list = [random.randint(1, 100000) for _ in range(size)]
        sorted_list = sorted(random_list)
        reverse_list = sorted(random_list, reverse=True)

        datasets = {
            "Random": random_list,
            "Sorted": sorted_list,
            "Reverse": reverse_list,
        }

        for name, data in datasets.items():
            times = []
            for alg_name, alg_func in algorithms:
                exec_time = measure_time(alg_func, data)
                times.append(exec_time)

            print(
                f"{name:<15} | {size:<6} | {times[0]:<20.2f} | {times[1]:<15.2f} | {times[2]:<15.2f}"
            )


if __name__ == "__main__":
    main()
