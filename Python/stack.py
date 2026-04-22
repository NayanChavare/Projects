# Stack Implementation in Python via List Alogorithm
class Stack:
    def __init__(self,stack_size):
        self.stack = [0]*stack_size
        self.max_size=stack_size
        self.top=-1
    
    def push(self, item):
        if self.top == self.max_size-1:
            print("Stack is full")
        else:
            self.top += 1
            self.stack[self.top] = item
    
    def pop(self):
        if self.top == -1:
            print("Stack is empty")
            return None
        else:
            item = self.stack[self.top]
            self.top -= 1
            return item
    def peek(self):
        if self.top == -1:
            print("Stack is empty")
            return None
        else:
            return self.stack[self.top]
    def is_empty(self):
        return self.top == -1
    
stack = Stack(5)
while True:
    print("Menu : \n 1. Push \n 2. Pop \n 3. Peek \n 4. Exit")
    choice = int(input("Enter your choice : "))
    if choice == 1:
        item = int(input("Enter the item to push : "))
        stack.push(item)
    elif choice == 2:
        item = stack.pop()
        if item is not None:
            print("Popped item : ", item)
    elif choice == 3:
        item = stack.peek()
        if item is not None:
            print("Peeked item : ", item)
    elif choice == 4:
        break