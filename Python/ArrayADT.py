class ArrayADT:
    
    def __init__(self, size):
        self.size=size
        self.arr=[]
        self.len_arr=0
        

    # Traversal
    def traverse(self):
        if self.len_arr==0:
            return "Empty"
        else:
            for i in self.arr:
                print(i,end=" ")
            print()
        

    # Insert an element at given index
    def insert(self, index, value):
        if self.len_arr==self.size:
            return "Overflow"
        if index>=0 and index<=self.size:
            try:
                for i in range(self.len_arr,index,-1):
                    self.arr[i]=self.arr[i-1]
                self.arr[index]=value
                self.len_arr+=1
            except IndexError:
                return "Invalid Index"
        else:
            return "Invalid Index"
    # Delete an element from given index
    def delete(self, index):
        if self.len_arr==0:
            return "Underflow"
        if index>=0 and index<self.len_arr:
            for i in range(index,self.len_arr-1):
                self.arr[i]=self.arr[i+1]
            self.len_arr-=1
        else:
            return "Invalid Index"
    # Search for an element
    def search(self, value):
        for i in range(self.len_arr):
            if self.arr[i]==value:
                return i
        return -1
        

    # Update value at given index
    def update(self, index, value):
        if index>=0 and index<self.len_arr:
            self.arr[index]=value
        else:
            return "Invalid Index"
        

    # Get current number of elements
    def get_size(self):
        return self.len_arr
       

    # Check if array is empty
    def is_empty(self):
        return self.len_arr == 0
        

    # Check if array is full
    def is_full(self):
        return self.len_arr == self.size

arr=ArrayADT(5)
arr.insert(0,10)
arr.insert(1,20)
arr.insert(2,30)
arr.traverse()
arr.delete(1)
arr.traverse()
print(arr.search(30))
arr.update(1,40)
arr.traverse()
print("Current Size:",arr.get_size())
print("Is Empty:",arr.is_empty())
print("Is Full:",arr.is_full())
arr.insert(2,50)
arr.insert(3,60)
arr.insert(4,70)
print("Is Full after insertions:",arr.is_full())
        