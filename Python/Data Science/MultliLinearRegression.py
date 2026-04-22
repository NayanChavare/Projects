# Multi Linear Regression

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# Load data
data = pd.read_csv("/Users/nayanyogeshchavare/Downloads/heart_disease.csv")
X = data.iloc[:, :-1].values
Y = data.iloc[:, -1].values
# Split data into train and test sets
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=0)
# Train model
model = LinearRegression()
model.fit(X_train, Y_train)
# Predict
Y_pred = model.predict(X_test)
# Evaluate
mse = mean_squared_error(Y_test, Y_pred)
r2 = r2_score(Y_test, Y_pred)
print(f"Mean Squared Error: {mse}")
print(f"R^2 Score: {r2}")
# Plot
plt.scatter(Y_test, Y_pred, color="blue")
plt.plot([Y.min(), Y.max()], [Y.min(), Y.max()], color="red", linewidth=2)
plt.xlabel("Actual")
plt.ylabel("Predicted")
plt.title("Actual vs Predicted")
plt.show()