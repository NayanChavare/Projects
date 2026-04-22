#include <iostream>
using namespace std;

int main(){
    string c="123456";
    int c1;
    string c2;
    string temp;
    string newstring;
    cout<<c.size()<<endl;
    cout<<c[0]<<endl;
    temp=c[0];
    c1=stoi(temp);
    cout<<c1<<endl;
    c2=to_string(c1);
    newstring=c+c2;
    cout<<newstring<<endl;
    return 0;
}