# Quick Sort in Python
def parts(arr,low,high):
    pivot=arr[high]
    i=low-1
    for j in range(low,high):
        if arr[j]<=pivot:
            i+=1
            arr[i],arr[j]=arr[j],arr[i]
    arr[i+1],arr[high]=arr[high],arr[i+1]
    return i+1

def quick_sort(arr,low,high):
    if low<high:
        pi=parts(arr,low,high)
        quick_sort(arr,low,pi-1)
        quick_sort(arr,pi+1,high)
    return arr

arr=[88,77,66,55,44,33,22,11]
n=len(arr)
print("Original array is:", arr)
sorted_arr=quick_sort(arr,0,n-1)
print("Sorted array is:", sorted_arr)