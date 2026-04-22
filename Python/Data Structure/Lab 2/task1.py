# Dynamic Arrary Simulation
class DynamicArray:
    def __init__(self):
        self._size = 0
        self._capacity = 1
        self._array = [None] * self._capacity

    def _resize(self, new_capacity):
        new_array = [None] * new_capacity
        for i in range(self._size):
            new_array[i] = self._array[i]
        self._array = new_array
        self._capacity = new_capacity

    def append(self, value):
        if self._size == self._capacity:
            self._resize(2 * self._capacity)
        self._array[self._size] = value
        self._size += 1

    def __getitem__(self, index):
        if index < 0 or index >= self._size:
            raise IndexError("Index out of bounds")
        return self._array[index]

    def __len__(self):
        return self._size

    def __str__(self):
        return str([self._array[i] for i in range(self._size)])

# Example Usage 
# arr=DynamicArray()
# arr._resize(2)
# arr.append(1)
# arr.append(2)
# arr.append(3)
# arr.append(4)
# print(arr)