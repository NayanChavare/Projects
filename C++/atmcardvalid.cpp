#include <iostream>
using namespace std;

int getDigit(const int num);
int sumodd(const string cardnumber);
int sumeven(const string cardnumber);
int main(){
    string cardnumber;
    int result=0;
    cout<<"Enter a credit card number:";
    cin>>cardnumber;
    result=sumodd(cardnumber)+sumeven(cardnumber);
    if (result%10==0){
        cout<<"Valid"<<endl;
    }
    else{
        cout<<"Not valid\n";
    }
    return 0;
}
int getDigit(const int num){
    return num%10+(num/10%10);
}
int sumodd(const string cardnumber){
    int sum=0;
    for (int i=cardnumber.size()-1;i=0;i-=2){
        sum+=getDigit((cardnumber[i]-'0'));

    }

    return sum;
}
int sumeven(const string cardnumber){
    int sum=0;
    for (int i=cardnumber.size()-2;i=0;i-=2){
        sum+=getDigit((cardnumber[i]-'0')*2);

    }

    return sum;
} 