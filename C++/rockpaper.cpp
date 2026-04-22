#include <iostream>
#include <ctime>
std::string getuser(std::string ch);
std::string robo();
std::string game(std::string user, std::string robot);
int main(){
    std::string ch;
    std::cout<<"Rock=R, Paper=P and Scissors=S\n";
    std::cout<<"Enter your choice: ";
    std::cin>>ch;
    std::string user=getuser(ch);
    std::string robot=robo();
    std::cout<<game(user,robot)<<std::endl;
    std::cout<<"Robot choose "<<robot<<std::endl;

}
std::string getuser(std::string ch){

    if (ch=="R" || ch=="r"){
        return "Rock";
    }
    else if (ch=="P" || ch=="p"){
        return "Paper";
    }
    else if (ch=="S" || ch=="s"){
        return "Scissors";
    }
    else{
        return "Wrong choice!";
    }
}
std::string robo(){
    srand(time(0));
    int num=rand()%3+1;
    switch (num){
        case 1:
        return "Scissors";
        
        case 2:
        return "Rock";
       
        case 3:
        return "Paper";
    
    }
    return 0;
}
std::string game(std::string user, std::string robot){
    if (user==robot){
        return "Tie!";
    }
    else if (user=="Rock" && robot=="Scissors"){
        return "Player win!";
    }
    else if (user=="Scissors" && robot=="Rock"){
        return "Robot wins!";
    }
    else if (user=="Rock" && robot=="Paper"){
        return "Robot wins!";
    }
    else if (user=="Paper" && robot=="Rock"){
        return "Player wins!";
    }
    else if (user=="Paper" && robot=="Scissors"){
        return "Robot wins!";
    }
    else if (user=="Scissors" && robot=="Paper"){
        return "Player wins!";
    }
    return 0;

}