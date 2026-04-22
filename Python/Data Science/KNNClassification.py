# K Classification
import numpy as np
import matplotlib.pyplot as plt
def Distance(x,grp):
    return abs(x-grp)
def Distance2D(x,grp):
    return np.sqrt((x[0]-grp[0])**2+(x[1]-grp[1])**2)
while True:
    print("Menu: 1. 1D KNN Classification 2. 2D KNN Classification 3. Exit")
    choice=int(input("Enter your choice: "))
    if choice==1:
        ch=int(input("Number of data points: "))
        Data=[]
        for i in range(ch):
            Data.append(int(input(f"Enter data point {i+1}: ")))
        grp=int(input("Number of groups: "))
        grp_data=[]
        for i in range(grp):
            grp_data.append(int(input(f"Enter centroid for group {i+1}: ")))
        
        while True:
            for i in Data:
                for j in grp_data:
                    d=Distance(i,j)
                    print(f"Distance of {i} from group {j}: {d}")
            for i in grp_data:
                newgrp=np.mean([x for x in Data if Distance(x,i)<Distance(x,grp_data[1-grp_data.index(i)])])
                print(f"New centroid for group {i}: {newgrp}")
            if newgrp==grp_data[grp_data.index(i)]:
                break
            grp_data[grp_data.index(i)]=newgrp
        

    elif choice==2:
        ch=int(input("Number of data points: "))
        Data=[]
        for i in range(ch):
            x=int(input(f"Enter x coordinate for data point {i+1}: "))
            y=int(input(f"Enter y coordinate for data point {i+1}: "))
            Data.append((x,y))
        grp=int(input("Number of groups: "))
        grp_data=[]
        for i in range(grp):
            x=int(input(f"Enter x coordinate for centroid of group {i+1}: "))
            y=int(input(f"Enter y coordinate for centroid of group {i+1}: "))
            grp_data.append((x,y))
        
        while True:
            for i in Data:
                for j in grp_data:
                    d=Distance2D(i,j)
                    print(f"Distance of {i} from group {j}: {d}")
            for i in grp_data:
                newgrp=np.mean([x for x in Data if Distance2D(x,i)<Distance2D(x,grp_data[1-grp_data.index(i)])], axis=0)
                print(f"New centroid for group {i}: {newgrp}")
            if np.array_equal(newgrp, grp_data[grp_data.index(i)]):
                break
            grp_data[grp_data.index(i)]=newgrp


    else:
        print("Exiting...")
        exit()

# grp1=3
# grp2=14
# newgrp1=0
# newgrp2=0
# while True:
#     for i in Data:
#         d1=Distance(i,grp1)
#         d2=Distance(i,grp2)
#         if d1<d2:
#             print(f"{i} belongs to group 1")
#         else:
#             print(f"{i} belongs to group 2")
#     newgrp1=np.mean([i for i in Data if Distance(i,grp1)<Distance(i,grp2)])
#     newgrp2=np.mean([i for i in Data if Distance(i,grp1)>=Distance(i,grp2)])
#     print(f"New group 1: {newgrp1}, New group 2: {newgrp2}")
#     if newgrp1==grp1 and newgrp2==grp2:
#         break
#     grp1=newgrp1
#     grp2=newgrp2