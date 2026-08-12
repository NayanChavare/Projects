import java.util.*;

class Main {
    // fibonacci series
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Give a number: ");
        int x = sc.nextInt();
        System.out.println("Fibonacci series: ");
        fibonacci(x);
        System.out.println("\nFibonacci series (recursive): ");
        fibonacciRecursive(x);
        sc.close();}
    public static void fibonacci(int x) {
        int a = 0, b = 1;
        System.out.print(a + " " + b + " ");
        for (int i = 2; i < x; i++) {
            int c = a + b;
            System.out.print(c + " ");
            a = b;
            b = c;
        }
    }
    public static void fibonacciRecursive(int x) {
        if (x==0){
            return 0;
        }else if (x==1){
            return 1;
        }else{
            return fibonacciRecursive(x-1) + fibonacciRecursive(x-2);
        }
    }

    // String reverse
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Give a string: ");
        String str = sc.nextLine();
        String reversedStr = reverseString(str);
        System.out.println("Reversed string: " + reversedStr);
        sc.close();
    }
    public static String reverseString(String str) {
        StringBuilder reversed = new StringBuilder();
        for (int i = str.length() - 1; i >= 0; i--) {
            reversed.append(str.charAt(i));
        }
        return reversed.toString();
    }
    
    // // count the  number of digits in a number
    // public static void main(String[] args) {
    //     Scanner sc = new Scanner(System.in);
    //     System.out.println("Give a number: ");
    //     int x = sc.nextInt();
    //     int digitCount = countDigits(x);
    //     System.out.println("Number of digits: " + digitCount);
    //     sc.close();
    // }
    // public static int countDigits(int x) {
    //     int count = 0;
    //     while (x != 0) {
    //         x /= 10;
    //         count++;
    //     }
    //     return count;
    // }
    // // recursive method to count the number of digits in a number
    // public static int countDigitsRecursive(int x) {
    //     if (x == 0) {
    //         return 0;
    //     } else {
    //         return 1 + countDigitsRecursive(x / 10);
    //     }
    // }    
}
    
    // public static void main(String[] args) {
    //     Scanner sc = new Scanner(System.in);
    //     System.out.println("Array size");
    //     int n = sc.nextInt();
    //     int[] arr = new int[n];
    //     for (int i = 0; i < n; i++) {
    //         arr[i] = sc.nextInt();
    //     }
    //     int[] result = find(arr);
    //     System.out.println("Odd count: " + result[0]);
    //     System.out.println("Even count: " + result[1]);
    //     sc.close();     
    // }
    // public static int find(int[] arr){
    //     int odd = 0;
    //     int even = 0;
    //     for (int i=0; i<arr.length; i++){
    //         if (arr[i]%2==0){
    //             even++;
    //         } else {
    //             odd++;
    //         }
    //     }
    //     return odd , even;
    // }
    // public static void main(String[] args) {
    //     Scanner sc = new Scanner(System.in);
    //     // System.out.println("Give a number: ");
    //     // int x = sc.nextInt();
    //     // System.out.println("Asscending");
    //     // asscending(x);
    //     // System.out.println("Descensding");
    //     // descensding(x);
    //     int sum = 0;
    //     System.out.println("Array size");
    //     int n = sc.nextInt();
    //     new int[] arr;
    //     for (int i = 0; i<n; i++){
    //       arr[i]=sc.nextInt();
    //     }
    //     // System.out.println()
    //     // int[] arr = {1,4,9};
    //     for (int i = 0; i < arr.length; i++){
    //       sum = sum + arr[i];
    //     }
    //     System.out.println(sum);
    //     // float x = sc.nextFloat();
    //     // float y = sc.nextFloat();
        
        
    //     // System.out.println("Addition: " + add(x, y));
    //     // System.out.println("Multiplication: " + mult(x, y));
    //     // System.out.println("Division: " + div(x, y));
        
    //     sc.close();

    // }
    
    // public static float add(float x, float y){
    //     return x + y;
    // }
    
    // public static float mult(float x, float y){
    //     return x * y;
    // }
    
    // public static float div(float x, float y){
    //     if (y == 0) {
    //         System.out.println("Error: Division by zero.");
    //         return 0;
    //     }
    //     return x / y;
    // }
    // public static void asscending(int x){
    //   for (int i=1; i<=x; i++){
    //     System.out.println(i);
    //   }
    // }
    // public static void descensding(int x){
    //   for (int i=x; i>0; i--){
    //     System.out.println(i);
    //   }
    // }
//     public static void main(String[] args){
//         Scanner sc = new Scanner(System.in);
//         System.out.println("Give a number: ");
//         int x = sc.nextInt();
//         System.out.println("Factorial: " + fact(x));
//         sc.close();
//     }
//     public static void fact(int x){
//         if (x==0 || x==1){
//             return 1;
//         } else {
//             return x * fact(x-1);
//         }
//     }
// }

// count number of odd and even numbers in an array
// import java.util.*;

// class Main {
//     public static void main(String[] args) {
//         Scanner sc = new Scanner(System.in);
//         System.out.println("Array size: ");
//         int n = sc.nextInt();
//         int[] arr = new int[n];
//         for (int i = 0; i < n; i++) {
//             System.out.println("Enter "+(i+1)+"th element: ");
//             arr[i] = sc.nextInt();
//         }
//         find(arr);
//         sc.close();     
//     }
//     public static void find(int[] arr){
//         int odd = 0;
//         int even = 0;
//         for (int i=0; i<arr.length; i++){
//             if (arr[i]%2==0){
//                 even++;
//           } else {
//                 odd++;
//       }
//     }
//     System.out.println("Gotten array: ");
//     for (int i=0; i<arr.length;i++) {
//       System.out.println(arr[i]);
//     }
//     System.out.println("Odd count: "+odd);
//     System.out.println("Even count: " + even);
//   }
// }
