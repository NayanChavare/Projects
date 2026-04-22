# Application-Balanced Parentheses Checker (Using Your Stack)

from task3 import Stack

class BalancedParenthesesChecker:
    def __init__(self):
        self.stack = Stack()
    
    def is_balanced(self, expression):
        parentheses_map = {')': '(', '}': '{', ']': '['}
        for char in expression:
            if char in parentheses_map.values():
                self.stack.push(char)
            elif char in parentheses_map.keys():
                if self.stack.is_empty() or self.stack.peek() != parentheses_map[char]:
                    return False
                self.stack.pop()
        return self.stack.is_empty()

# Example Usage

# check=BalancedParenthesesChecker()
# print(check.is_balanced("[{}]"))

