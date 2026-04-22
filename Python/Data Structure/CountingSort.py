# Counting Sort Algorithm Implementation in Python

def counting_sort(arr):
    if not arr:
        return []

    max_element = max(arr)
    count = [0] * (max_element+1)
    for i in arr:
        count[i]+=1
    
    for i in range(1, len(count)):
        count[i] += count[i-1]
    
    output = [0] * len(arr)

    for i in range(len(arr)-1, -1, -1):
        output[count[arr[i]]-1] = arr[i]
        count[arr[i]] -= 1

    return output

arr=[4, 2, 2, 8, 3, 3, 1]
sorted_arr = counting_sort(arr)
print("Sorted array:", sorted_arr)