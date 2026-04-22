# Stack & Queue from scratch using singly linked list

# A) Stack ADT (LIFO) using singly linked list
class StackNode:
    def __init__(self, data):
        self.data = data
        self.next = None

class Stack:
    def __init__(self):
        self.top = None
    def push(self, data):
        new_node = StackNode(data)
        new_node.next = self.top
        self.top = new_node
    def pop(self):
        if not self.top:
            raise IndexError("Stack underflow")
        data = self.top.data
        self.top = self.top.next
        return data
    def peek(self):
        if not self.top:
            raise IndexError("Stack is empty")
        return self.top.data
    def is_empty(self):
        return self.top is None
    def __str__(self):
        current = self.top
        elements = []
        while current:
            elements.append(str(current.data))
            current = current.next
        return "->".join(elements)
    

# B) Queue ADT (FIFO) using singly linked list
class QueueNode:
    def __init__(self, data):
        self.data = data
        self.next = None

class Queue:
    def __init__(self):
        self.front = None
        self.rear = None
    
    def enqueue(self, data):
        new_node = QueueNode(data)
        if not self.rear:
            self.front = new_node
            self.rear = new_node
            return
        self.rear.next = new_node
        self.rear = new_node
    
    def dequeue(self):
        if not self.front:
            raise IndexError("Queue underflow")
        data = self.front.data
        self.front = self.front.next
        if not self.front:
            self.rear = None
        return data
    def peek(self):
        if not self.front:
            raise IndexError("Queue is empty")
        return self.front.data
    def is_empty(self):
        return self.front is None
    def __str__(self):
        current = self.front
        elements = []
        while current:
            elements.append(str(current.data))
            current = current.next
        return "->".join(elements)


#Example Usage
# A)
# s=Stack()
# s.is_empty()
# s.push(1)
# s.push(2)
# s.push(3)
# s.peek()
# print(s)
# s.pop()
# print(s)

# # B)
# q=Queue()
# q.is_empty()
# q.enqueue(1)
# q.enqueue(2)
# q.peek
# print(q)
# q.dequeue()
# print(q)