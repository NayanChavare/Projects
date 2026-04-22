import pandas as pd
import numpy as np

# Load data
data = pd.read_csv('mnist_train.csv')
data = np.array(data)
m, n = data.shape
np.random.shuffle(data)  # shuffle before splitting

# Split dev and train sets
data_dev = data[0:1000].T
Y_dev = data_dev[0]
X_dev = data_dev[1:n]
X_dev = X_dev / 255.

data_train = data[1000:m].T
Y_train = data_train[0]
X_train = data_train[1:n]
X_train = X_train / 255.
_, m_train = X_train.shape

# ---------------- Initialization ----------------
def init_params():
    W1 = np.random.randn(128, 784) * np.sqrt(2./784)
    b1 = np.zeros((128, 1))
    W2 = np.random.randn(10, 128) * np.sqrt(2./128)
    b2 = np.zeros((10, 1))
    return W1, b1, W2, b2

# ---------------- Activations ----------------
def ReLU(Z): 
    return np.maximum(0, Z)
def ReLU_deriv(Z): 
    return Z > 0
def softmax(Z):
    expZ = np.exp(Z - np.max(Z, axis=0))
    return expZ / np.sum(expZ, axis=0)

# ---------------- Forward & Backward ----------------
def forward_prop(W1, b1, W2, b2, X):
    Z1 = W1.dot(X) + b1
    A1 = ReLU(Z1)
    Z2 = W2.dot(A1) + b2
    A2 = softmax(Z2)
    return Z1, A1, Z2, A2

def one_hot(Y):
    one_hot_Y = np.zeros((Y.size, Y.max() + 1))
    one_hot_Y[np.arange(Y.size), Y] = 1
    return one_hot_Y.T

def backward_prop(Z1, A1, Z2, A2, W1, W2, X, Y):
    m = X.shape[1]
    one_hot_Y = one_hot(Y)
    dZ2 = A2 - one_hot_Y
    dW2 = 1 / m * dZ2.dot(A1.T)
    db2 = 1 / m * np.sum(dZ2, axis=1, keepdims=True)
    dZ1 = W2.T.dot(dZ2) * ReLU_deriv(Z1)
    dW1 = 1 / m * dZ1.dot(X.T)
    db1 = 1 / m * np.sum(dZ1, axis=1, keepdims=True)
    return dW1, db1, dW2, db2

def update_params(W1, b1, W2, b2, dW1, db1, dW2, db2, alpha):
    W1 -= alpha * dW1
    b1 -= alpha * db1
    W2 -= alpha * dW2
    b2 -= alpha * db2
    return W1, b1, W2, b2

# ---------------- Helpers ----------------
def get_predictions(A2): 
    return np.argmax(A2, 0)
def get_accuracy(pred, Y): 
    return np.sum(pred == Y) / Y.size
def compute_loss(A2, Y):
    m = Y.size
    log_likelihood = -np.log(A2[Y, np.arange(m)])
    return np.sum(log_likelihood) / m

# ---------------- Training ----------------
def gradient_descent(X, Y, alpha, iterations):
    W1, b1, W2, b2 = init_params()
    for i in range(iterations+1):
        Z1, A1, Z2, A2 = forward_prop(W1, b1, W2, b2, X)
        dW1, db1, dW2, db2 = backward_prop(Z1, A1, Z2, A2, W1, W2, X, Y)
        W1, b1, W2, b2 = update_params(W1, b1, W2, b2, dW1, db1, dW2, db2, alpha)
        if i % 100 == 0:
            predictions = get_predictions(A2)
            acc = get_accuracy(predictions, Y)
            loss = compute_loss(A2, Y)
            print(f"Iteration {i}: Loss={loss:.4f}, Accuracy={acc:.4f}")
    return W1, b1, W2, b2

# ---------------- Run training ----------------
W1, b1, W2, b2 = gradient_descent(X_train, Y_train, alpha=0.1, iterations=100)

# ---------------- Save model ----------------
np.savez("mnist_model.npz", W1=W1, b1=b1, W2=W2, b2=b2)
print("Model saved as mnist_model.npz ✅")
import numpy as np
import pandas as pd

layer_sizes = [14, 64, 32, 16, 2]
learning_rate = 0.1
iterations = 2000
dev_ratio = 0.2

# =====================================================
# LOAD DATA
# =====================================================

data = pd.read_csv("train.csv")

data["Heart Disease"] = data["Heart Disease"].map({
    "Presence": 1,
    "Absence": 0
})

data = np.array(data)

np.random.shuffle(data)

m, n = data.shape

X = data[:, 0:n-1].astype(float)
Y = data[:, n-1].astype(int)

# normalize
X = (X - np.mean(X, axis=0)) / np.std(X, axis=0)

# split
split = int((1-dev_ratio)*m)

X_train = X[:split].T
Y_train = Y[:split]

X_dev = X[split:].T
Y_dev = Y[split:]

print("Train:", X_train.shape)
print("Dev:", X_dev.shape)

# =====================================================
# INITIALIZATION
# =====================================================

def init_params(layer_sizes):

    params = {}

    for i in range(1, len(layer_sizes)):

        params["W"+str(i)] = (
            np.random.randn(layer_sizes[i], layer_sizes[i-1])
            * np.sqrt(2/layer_sizes[i-1])
        )

        params["b"+str(i)] = np.zeros((layer_sizes[i], 1))

    return params

# =====================================================
# ACTIVATIONS
# =====================================================

def ReLU(Z):
    return np.maximum(0, Z)

def ReLU_deriv(Z):
    return Z > 0

def softmax(Z):

    expZ = np.exp(Z - np.max(Z, axis=0, keepdims=True))

    return expZ / np.sum(expZ, axis=0, keepdims=True)

# =====================================================
# FORWARD PROP
# =====================================================

def forward_prop(X, params):

    cache = {}

    A = X

    L = len(params)//2

    for i in range(1, L):

        Z = params["W"+str(i)] @ A + params["b"+str(i)]

        A = ReLU(Z)

        cache["Z"+str(i)] = Z
        cache["A"+str(i)] = A

    # output layer
    ZL = params["W"+str(L)] @ A + params["b"+str(L)]

    AL = softmax(ZL)

    cache["Z"+str(L)] = ZL
    cache["A"+str(L)] = AL

    return AL, cache

# =====================================================
# ONE HOT
# =====================================================

def one_hot(Y):

    one_hot_Y = np.zeros((layer_sizes[-1], Y.size))

    one_hot_Y[Y, np.arange(Y.size)] = 1

    return one_hot_Y

# =====================================================
# BACKPROP
# =====================================================

def backward_prop(X, Y, params, cache):

    grads = {}

    L = len(params)//2

    m = X.shape[1]

    one_hot_Y = one_hot(Y)

    # output layer gradient
    dZ = cache["A"+str(L)] - one_hot_Y

    for i in reversed(range(1, L+1)):

        A_prev = X if i == 1 else cache["A"+str(i-1)]

        grads["dW"+str(i)] = (1/m) * dZ @ A_prev.T

        grads["db"+str(i)] = (1/m) * np.sum(dZ, axis=1, keepdims=True)

        if i > 1:

            dA_prev = params["W"+str(i)].T @ dZ

            dZ = dA_prev * ReLU_deriv(cache["Z"+str(i-1)])

    return grads

# =====================================================
# UPDATE
# =====================================================

def update_params(params, grads, lr):

    L = len(params)//2

    for i in range(1, L+1):

        params["W"+str(i)] -= lr * grads["dW"+str(i)]

        params["b"+str(i)] -= lr * grads["db"+str(i)]

    return params

# =====================================================
# METRICS
# =====================================================

def get_predictions(AL):

    return np.argmax(AL, axis=0)

def get_accuracy(pred, Y):

    return np.mean(pred == Y)

def compute_loss(AL, Y):

    m = Y.size

    loss = -np.log(AL[Y, np.arange(m)])

    return np.mean(loss)

# =====================================================
# TRAIN
# =====================================================

def train(X, Y, X_dev, Y_dev, layer_sizes, lr, iterations):

    params = init_params(layer_sizes)

    for i in range(iterations):

        AL, cache = forward_prop(X, params)

        grads = backward_prop(X, Y, params, cache)

        params = update_params(params, grads, lr)

        if i % 100 == 0:

            train_pred = get_predictions(AL)

            train_acc = get_accuracy(train_pred, Y)

            loss = compute_loss(AL, Y)

            AL_dev, _ = forward_prop(X_dev, params)

            dev_pred = get_predictions(AL_dev)

            dev_acc = get_accuracy(dev_pred, Y_dev)

            print(
                f"Iter {i} | "
                f"Loss {loss:.4f} | "
                f"Train Acc {train_acc:.4f} | "
                f"Dev Acc {dev_acc:.4f}"
            )

    return params

# =====================================================
# RUN
# =====================================================

params = train(
    X_train,
    Y_train,
    X_dev,
    Y_dev,
    layer_sizes,
    learning_rate,
    iterations
)

# =====================================================
# SAVE MODEL
# =====================================================

np.savez("heart_deep_model.npz", **params)

print("\nDeep model saved successfully.")