#include <iostream>
#include <vector>
#include <algorithm>
#include <ctime>
using namespace std;

int main(){
    srand(time(0));
    char playo='O';
    int pos;
    int roboIndex;
    char play[5][5] = {{'1','|','2','|','3'},
                      {'-','-','-','-','-'},
                      {'4','|','5','|','6'},
                      {'-','-','-','-','-'},
                      {'7','|','8','|','9'}};
    vector<int> possible={1,2,3,4,5,6,7,8,9};              
                      
    while (true){
        for (int i=0;i<=4;i++){
            for (int j=0;j<=4;j++){
                cout<<play[i][j];
            }
            cout<<endl;}
        cout<<"Enter position: ";
        cin>>pos;
        switch (pos){
            case 1:
            if (play[0][0]=='O' || play[0][0]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[0][0]=playo;
                break;}
            case 2:
            if (play[0][2]=='O' || play[0][2]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[0][2]=playo;
                break;}
            case 3:
            if (play[0][4]=='O' || play[0][4]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[0][4]=playo;
                break;}
            case 4:
            if (play[2][0]=='O' || play[2][0]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[2][0]=playo;
                break;}
            case 5:
            if (play[2][2]=='O' || play[2][2]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[2][2]=playo;
                break;}
            case 6:
            if (play[2][4]=='O' || play[2][4]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[2][4]=playo;
                break;}
            case 7:
            if (play[4][0]=='O' || play[4][0]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[4][0]=playo;
                break;}
            case 8:
            if (play[4][2]=='O' || play[4][2]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[4][2]=playo;
                break;}
            case 9:
            if (play[4][4]=='O' || play[4][4]=='X'){
                cout<<"Invalid move!\n";
                break;
            }
            else{
                play[4][4]=playo;
                break;}
            
            default:
            break;


        }
        possible.erase(remove(possible.begin(), possible.end(), pos), possible.end());
       
        roboIndex=rand()%possible.size();

        int robo=possible[roboIndex];

        int roboIndex = rand() % possible.size();
        robo = possible[roboIndex];

        switch (robo) {
            case 1: play[0][0]='X'; break;
            case 2: play[0][2]='X'; break;
            case 3: play[0][4]='X'; break;
            case 4: play[2][0]='X'; break;
            case 5: play[2][2]='X'; break;
            case 6: play[2][4]='X'; break;
            case 7: play[4][0]='X'; break;
            case 8: play[4][2]='X'; break;
            case 9: play[4][4]='X'; break;
        }


        
        possible.erase(remove(possible.begin(), possible.end(), robo), possible.end());
    

        

    }                
    
    
       
    return 0;
}

