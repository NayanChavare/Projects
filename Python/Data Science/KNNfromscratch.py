# KNN from scratch
#import os
import numpy as np
from collections import Counter
#import pandas as pd
#from sklearn.model_selection import train_test_split
#from matplotlib import pyplot as plt
#from sklearn.preprocessing import LabelEncoder

#label_encoder = LabelEncoder()

def euclidean_distance(point1, point2):
	return np.sqrt(np.sum((point1 - point2) ** 2))

def knn_predict(X_train, y_train, X_test, k):
	predictions = []
	for test_point in X_test:
		distances = [(euclidean_distance(test_point, train_point), label) for train_point, label in zip(X_train, y_train)]
		distances.sort(key=lambda x: x[0])
		k_nearest = distances[:k]
		k_nearest_labels = [label for _, label in k_nearest]
		most_common = Counter(k_nearest_labels).most_common(1)
		predictions.append(most_common[0][0])
	return predictions