# Algorithmic Efficiency & Recursion Toolkit (AERT) Analysis

## Part A: Stack ADT

**What is an ADT?**

An Abstract Data Type (ADT) is a conceptual model that defines a data structure by its mathematical behavior and operations (like push, pop) rather than its specific memory implementation (like arrays or linked lists).

**Why stack operations are O(1)?**

Stack operations are primarily constant time because elements are only added or removed from a single location (the top). There is no need to traverse the structure or shift other elements.

## Part B: Factorial & Fibonacci

+ **Factorial Complexity**: 
    * Time Complexity: O(n), as it requires n recursive calls to reach the base case.

    * Space Complexity: O(n), because n frames are placed on the call stack simultaneously.

+ **Fibonacci Complexity**:

    + **Naive Time**: O(2 
    n
    ). Space: O(n). It calculates the same subproblems repeatedly.

    + **Memoized Time**: O(n). Space: O(n). By storing results, it calculates each value only once.

    **Note**: Big-Ω for naive is Ω(2 
    n
    ) (worst and best case are structurally the same). Big-Θ is Θ(2 
    n
    ).

+ **Why Naive is slow**: The naive approach branches into two more calls for almost every step, creating an exponentially growing recursion tree full of redundant calculations.

## Part C: Tower of Hanoi

+ **Why moves become 2** 
n
 −1: To move n disks, you must mathematically move the top n−1 disks out of the way, move the bottom disk once, and then move the n−1 disks back on top. This creates the recurrence M(n)=2M(n−1)+1, which resolves exactly to 2 
n
 −1.

+ **Time Complexity**: O(2 
    n
    ) due to the exponential number of moves.

+ **Space Complexity**: O(n), representing the maximum depth of the recursion call stack.

## Part D: Recursive Binary Search

+ **Recurrence Relation**: T(n)=T(n/2)+O(1). At each step, the algorithm cuts the array size in half (n/2) and performs a constant O(1) comparison. This resolves to O(log n).

+ **Cases**:

    + **Best Case**: O(1). The middle element is exactly the key we are looking for on the very first try.

    + **Average & Worst Case**: O(log n). The key is at the far ends of the array or not present, forcing the array to be divided until only one element remains.

## Part E: Short Paradigm Reflection

+ **Divide & Conquer (Binary Search)**: Binary search exemplifies this paradigm because it takes a large problem (searching a whole array), divides it into a smaller subproblem (searching half the array), and completely ignores the other half.

    + **Real-life example**: Looking up a name in a physical phonebook by opening to the middle and eliminating half the book instantly.

+ **Dynamic Programming (Fibonacci Memoized)**: DP solves the issue of "overlapping subproblems." Memoization prevents the algorithm from recalculating n values it has already solved by saving them to memory.

    + **Real-life example**: Writing down the answer to a complex math equation on a sticky note so you don't have to calculate it again if asked five minutes later.

+ **Recursion (Tower of Hanoi)**: The problem is solved by breaking it down into a smaller identical subproblem (moving n−1 disks), anchored by a base case (moving 1 disk) to stop infinite loops.

+ **Greedy (Conceptual)**: Making the locally optimal choice at each stage with the hope of finding a global optimum.

    + **Real-life example**: A cashier giving you the largest possible coin denominations first when handing back change to minimize the total number of coins.