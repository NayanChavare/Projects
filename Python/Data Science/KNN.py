
from pathlib import Path

from matplotlib import pyplot as plt
from matplotlib.colors import ListedColormap
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder


csv_path = Path(__file__).with_name("knn.csv")
if not csv_path.exists():
	raise FileNotFoundError(
		f"Dataset not found at {csv_path}. Create knn.csv with columns: weight,height,class"
	)

df = pd.read_csv(csv_path)
required_columns = {"weight", "height", "class"}
if not required_columns.issubset(df.columns):
	raise ValueError(
		"CSV must contain columns: weight, height, class"
	)

X_raw = df[["weight", "height"]].astype(float).to_numpy()
y_raw = df["class"].astype(str).to_numpy()


label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y_raw)


feature_mean = np.mean(X_raw, axis=0)
feature_std = np.std(X_raw, axis=0)
if np.any(feature_std == 0):
	raise ValueError("Cannot standardize features with zero standard deviation")

X = (X_raw - feature_mean) / feature_std

X_train, X_dev, y_train, y_dev = train_test_split(
	X, y, test_size=0.2, random_state=42, stratify=y
)

knn = KNeighborsClassifier(n_neighbors=2)
knn.fit(X_train, y_train)

y_pred = knn.predict(X_dev)
accuracy = accuracy_score(y_dev, y_pred)
print(f"Accuracy: {accuracy:.4f}")

print("Class mapping:")
for idx, class_name in enumerate(label_encoder.classes_):
	print(f"  {idx}: {class_name}")

choice = input("Do you want to predict using custom weight/height? (y/n): ").strip().lower()
if choice in {"y", "yes"}:
	try:
		custom_weight = float(input("Enter weight: ").strip())
		custom_height = float(input("Enter height: ").strip())
		custom_sample = np.array([[custom_weight, custom_height]])
		custom_scaled = (custom_sample - feature_mean) / feature_std
		predicted_idx = knn.predict(custom_scaled)[0]
		predicted_class = label_encoder.inverse_transform([predicted_idx])[0]
		print(f"Predicted class: {predicted_class}")
	except ValueError:
		print("Invalid input. Please enter numeric values for weight and height.")

#plt.figure(figsize=(12, 8), dpi=120)

num_classes = len(label_encoder.classes_)
class_colors = plt.cm.tab10(np.linspace(0, 1, num_classes))
class_cmap = ListedColormap(class_colors)

all_X = np.vstack((X_train, X_dev))
x_min, x_max = all_X[:, 0].min() - 0.8, all_X[:, 0].max() + 0.8
y_min, y_max = all_X[:, 1].min() - 0.8, all_X[:, 1].max() + 0.8
xx, yy = np.meshgrid(
	np.linspace(x_min, x_max, 350),
	np.linspace(y_min, y_max, 350),
)
grid_points = np.c_[xx.ravel(), yy.ravel()]
grid_pred = knn.predict(grid_points).reshape(xx.shape)

fig, axes = plt.subplots(1, 2, figsize=(15, 6), dpi=120, sharex=True, sharey=True)

for ax, labels, title in [
	(axes[0], y_dev, "Ground Truth Labels"),
	(axes[1], y_pred, "Model Predictions"),
]:
	ax.contourf(xx, yy, grid_pred, cmap=class_cmap, alpha=0.2, levels=num_classes)
	for class_idx, class_name in enumerate(label_encoder.classes_):
		mask = labels == class_idx
		ax.scatter(
			X_dev[mask, 0],
			X_dev[mask, 1],
			s=95,
			c=[class_colors[class_idx]],
			edgecolors="black",
			linewidths=0.7,
			label=class_name,
		)

	ax.set_title(title)
	ax.set_xlabel("Weight (standardized)")
	ax.grid(alpha=0.22, linestyle="--")

axes[0].set_ylabel("Height (standardized)")

misclassified = y_dev != y_pred
if np.any(misclassified):
	axes[1].scatter(
		X_dev[misclassified, 0],
		X_dev[misclassified, 1],
		s=220,
		facecolors="none",
		edgecolors="crimson",
		linewidths=2,
		label="Misclassified",
	)

handles, labels = axes[0].get_legend_handles_labels()
if np.any(misclassified):
	handles2, labels2 = axes[1].get_legend_handles_labels()
	for handle, label in zip(handles2, labels2):
		if label == "Misclassified":
			handles.append(handle)
			labels.append(label)
			break

fig.legend(handles, labels, loc="upper center", ncol=min(4, len(labels)), frameon=True)
fig.suptitle(f"KNN on Standardized Weight/Height (Accuracy: {accuracy:.2f})", y=1.03)
plt.tight_layout()
plt.show()