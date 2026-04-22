#Factorila of a number using recursion
def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)
num = int(input("Enter a number to find its factorial: "))
result = factorial(num)
print(f"The factorial of {num} is {result}")

#Factorial of a number using non-recursion
def factorial_non_recursive(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
        print(result)
num_non_recursive = int(input("Enter a number to find its factorial (non-recursive): "))
result_non_recursive = factorial_non_recursive(num_non_recursive)
print(f"The factorial of {num_non_recursive} (non-recursive) is {result_non_recursive}")