#Binary Search
class Search:
    def __init__(self,arr):
        self.arr=sorted(arr)
    
    def bs(self,target):
        low,high=0,len(self.arr)-1
        while low<=high:
            mid=(low+high)//2
            if self.arr[mid]==target:
                return mid
            elif self.arr[mid]<target:
                low=mid+1
            else:
                high=mid-1
        return -1

arr=Search([1,3,6,8,10,44,23,66,22,80,100,21])
tar=int(input("Enter the element to find : "))
ans=arr.bs(tar)
if ans==-1:
    print("Element not in array!")
else:
    print(f"Element is at {ans+1}")