#include <iostream>

double bal(double bal);
double desposite(double bal,double des);
double withdraw(double bal,double with);
int main(){
	double bal=0;
	double des;
	double with;
	int c;
	std::string ch="y";
	do{
		std::cout<<"Menu:\n1.Check Balance\n2.Deposite\n3.Withdraw\n";
		std::cout<<"Enter your choice:";
		std::cin>>c;
		switch (c){
			case 1:
			std::cout<<"Your balance : ₹"<<bal<<std::endl;
			break;
			case 2:
			std::cout<<"Enter the deposite amount:";
			std::cin>>des;
			bal=desposite(bal,des);
			std::cout<<"Your balance : ₹"<<bal<<std::endl;
			break;
			case 3:
			std::cout<<"Enter the withdrawl amount:";
			std::cin>>with;
			bal=withdraw(bal,with);
			std::cout<<"Your balance : ₹"<<bal<<std::endl;
			break;
			default:
			break;

		}
		std::cout<<"Do you want to continue?(Y/N)";
		std::cin>>ch;
	}while (ch=="y" || ch=="Y");
	return 0;
}

double bal(double bal){
	return bal;
}
double desposite(double bal,double des){
	return bal+des;
}
double withdraw(double bal,double with){
	if (bal<with){
		std::cout<<"Not sufficient balance...\n";
		return bal;
	}
	else{
		return bal-with;
	}
	
}