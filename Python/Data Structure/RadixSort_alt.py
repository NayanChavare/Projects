def Count(arr):
    if type(arr[0])==str:
        for i in range(len(arr)):
            arr[i]=int(arr[i])
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

def Radix(arr):
    max_element=max(arr)
    str_max=str(max_element)
    max_len=len(str_max)
    for i in range(len(arr)):
        arr[i]=str(arr[i])
        if len(arr[i])<max_len:
            arr[i]='0'*(max_len-len(arr[i]))+arr[i]
    
    for i in range(max_len-1, -1, -1):
        arr=Count(arr)
    for i in range(len(arr)):
        arr[i]=int(arr[i])
    return arr

arr=[170, 45, 75, 90, 2, 802, 24, 66]
print(arr)
print(Radix(arr))