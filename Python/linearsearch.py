#linear search algorithm in python
class LinearSearch:
    def __init__(self,arr):
        self.arr=arr
    def linear_search(self,target):
        for i in range(len(self.arr)):
            if self.arr[i] == target:
                return f"Found at index {i}"
        return "Not Found"

arr=[10,20,30,40,50]
search=LinearSearch(arr)
print(search.linear_search(30))

'''Linear search Algorithm : 
1. Take a array arr
2. Take a target value to search
3. Set index i to 0
4. Repeat until i is less than length of arr
    A. If arr[i] is equal to target
        a. Return "Found at index i"
        b. Stop
    B. Increment i by 1
5. Return "Not Found"
6. Stop
'''