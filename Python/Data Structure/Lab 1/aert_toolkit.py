# aert_toolkit.py

# ==========================================
# Part A: Stack ADT
# ==========================================
class StackADT:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None

    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

# ==========================================
# Part B: Factorial & Fibonacci
# ==========================================
def factorial(n):
    if n < 0:
        return "Invalid input (n must be >= 0)"
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

# Counters for Fibonacci tracking
naive_calls = 0
memo_calls = 0
memo_dict = {}

def fib_naive(n):
    global naive_calls
    naive_calls += 1
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

def fib_memo(n):
    global memo_calls
    memo_calls += 1
    if n in memo_dict:
        return memo_dict[n]
    if n <= 1:
        return n
    
    memo_dict[n] = fib_memo(n - 1) + fib_memo(n - 2)
    return memo_dict[n]

# ==========================================
# Part C: Tower of Hanoi
# ==========================================
# Using StackADT to store moves before printing
hanoi_moves = StackADT()

def hanoi(n, source, auxiliary, destination):
    if n == 1:
        hanoi_moves.push(f"Move disk 1 from {source} to {destination}")
        return
    hanoi(n - 1, source, destination, auxiliary)
    hanoi_moves.push(f"Move disk {n} from {source} to {destination}")
    hanoi(n - 1, auxiliary, source, destination)

# ==========================================
# Part D: Recursive Binary Search
# ==========================================
def binary_search(arr, key, low, high):
    if len(arr) == 0:
        return -1
    if low > high:
        return -1
        
    mid = (low + high) // 2
    if arr[mid] == key:
        return mid
    elif arr[mid] > key:
        return binary_search(arr, key, low, mid - 1)
    else:
        return binary_search(arr, key, mid + 1, high)

# ==========================================
# Main Execution (Test Cases)
# ==========================================
if __name__ == "__main__":
    print("--- Part B: Factorial ---")
    for n in [0, 1, 5, 10]:
        print(f"Factorial of {n} is: {factorial(n)}")

    print("\n--- Part B: Fibonacci ---")
    for n in [5, 10, 20, 30]:
        # Reset counters and memoization dict for accurate tracking
        naive_calls = 0
        memo_calls = 0
        memo_dict = {}
        
        ans_naive = fib_naive(n)
        ans_memo = fib_memo(n)
        print(f"Fibonacci({n}) = {ans_naive}")
        print(f"  Naive calls: {naive_calls}")
        print(f"  Memo calls:  {memo_calls}")

    print("\n--- Part C: Tower of Hanoi (N=3) ---")
    hanoi(3, 'A', 'B', 'C')
    # Extracting moves from stack. Note: Stack pops in reverse order, 
    # so we reverse it to print chronologically.
    moves = []
    while not hanoi_moves.is_empty():
        moves.append(hanoi_moves.pop())
    moves.reverse()
    for move in moves:
        print(move)

    print("\n--- Part D: Binary Search ---")
    arr = [1, 3, 5, 7, 9, 11, 13]
    print(f"Array: {arr}")
    for key in [7, 1, 13, 2]:
        idx = binary_search(arr, key, 0, len(arr) - 1)
        print(f"Search {key}: Index {idx}")
        
    empty_arr = []
    idx_empty = binary_search(empty_arr, 5, 0, len(empty_arr) - 1)
    print(f"Empty array search for 5: Index {idx_empty}")