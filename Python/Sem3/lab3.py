def analysis(n):


def fibo_recursive(n):
    if n <= 1:
        return n
    else:
        return fibo_recursive(n-1) + fibo_recursive(n-2)

def fibo(n):
    a, b = 0, 1
    for i in range(n):
        a, b = b, a + b
    return a

def fact_recursive(n):
    if n == 0:
        return 1
    else:
        return n * fact_recursive(n-1)

def fact(n):
    
    