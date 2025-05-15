import pandas as pd
import numpy as np
import joblib
import sys
import ast
from collections import deque  # To store past readings for rolling calculations

# Load the trained model
rf_model = joblib.load('models/random2_forest_model.pkl')  # Update path if needed

# Store the last N readings for rolling calculations
window_size = 60
sensor_history = deque(maxlen=window_size)

# Function to compute features for a new reading
def compute_motion_features_from_new_reading(new_reading):
    global sensor_history

    # Append new reading to history
    sensor_history.append(new_reading)

    # Convert to DataFrame
    df = pd.DataFrame(sensor_history, columns=["AccX", "AccY", "AccZ", "GyroX", "GyroY", "GyroZ"])

    # Compute jerk (change in acceleration)
    for col in ["AccX", "AccY", "AccZ"]:
        df[f"{col}_jerk"] = df[col].diff()

    # Compute rolling mean & standard deviation
    for col in ["AccX", "AccY", "AccZ"]:
        df[f"{col}_rolling_mean"] = df[col].rolling(window=window_size, min_periods=1).mean()
        df[f"{col}_rolling_std"] = df[col].rolling(window=window_size, min_periods=1).std()

    # Take the most recent row with features
    latest_features = df.iloc[-1:]

    # Drop raw sensor columns
    drop_columns = ["AccX", "AccY", "AccZ", "GyroX", "GyroY", "GyroZ"]
    latest_features = latest_features.drop(columns=drop_columns, errors='ignore')

    return latest_features

# Function to predict label for a single reading
def predict_label(new_reading):
    processed_features = compute_motion_features_from_new_reading(new_reading)

    if processed_features.isnull().values.any():
        return "Insufficient data"

    prediction = rf_model.predict(processed_features)
    return prediction[0]

# ✅ Accept input from Node.js
if __name__ == '__main__':
    try:
        new_reading = ast.literal_eval(sys.argv[1])  # Example: "[0.12, 0.05, 9.81, 0.01, 0.02, 0.03]"
        label = predict_label(new_reading)
        print(label)
    except Exception as e:
        print(f"Error: {e}")
