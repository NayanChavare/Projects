# Queue Implementation using List Algorithm
class Queue:
    def __init__(self, queue_size):
        self.queue = [0] * queue_size
        self.max_size = queue_size
        self.front = -1
        self.rear = -1
        self.size = 0

    def enqueue(self, item):
        if self.size == self.max_size:
            print("Queue is full")
        else:
            self.rear = self.rear + 1 
            self.queue[self.rear] = item
            self.size += 1

    def dequeue(self):
        if self.size == 0:
            print("Queue is empty")
            return None
        else:
            item = self.queue[self.front]
            self.front = self.front + 1
            self.size -= 1
            return item

    def peek(self):
        if self.size == 0:
            print("Queue is empty")
            return None
        else:
            return self.queue[self.front]

    def is_empty(self):
        return self.size == 0

    def is_full(self):
        return self.size == self.max_size

    def get_size(self):
        return self.size

queue = Queue(5)
while True:
    print("Menu : \n 1. Enqueue \n 2. Dequeue \n 3. Peek \n 4. Exit")
    choice = int(input("Enter your choice : "))
    if choice == 1:
        item = int(input("Enter the item to enqueue : "))
        queue.enqueue(item)
    elif choice == 2:
        item = queue.dequeue()
        if item is not None:
            print("Dequeued item : ", item)
    elif choice == 3:
        item = queue.peek()
        if item is not None:
            print("Peeked item : ", item)
    elif choice == 4:
        break