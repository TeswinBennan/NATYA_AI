import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing import image_dataset_from_directory

# Configurations
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
INITIAL_EPOCHS = 15
FINE_TUNE_EPOCHS = 12
TOTAL_EPOCHS = INITIAL_EPOCHS + FINE_TUNE_EPOCHS
INITIAL_LR = 0.001
FINE_TUNE_LR = 0.0001

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset", "combined_raw")
MODELS_DIR = os.path.join(BASE_DIR, "backend", "models")

def train_model():
    print("=" * 60)
    print("NATYAA AI: ADVANCED CLASS-BALANCED RETRAINING")
    print("=" * 60)

    os.makedirs(MODELS_DIR, exist_ok=True)

    # 1. Load Dataset
    print("[INFO] Loading dataset from:", DATASET_DIR)
    train_dataset = image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    val_dataset = image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    class_names = train_dataset.class_names
    num_classes = len(class_names)
    print(f"[INFO] Found {num_classes} classes: {class_names}")

    # Save class indices for backend
    indices_map = {str(i): name for i, name in enumerate(class_names)}
    with open(os.path.join(MODELS_DIR, "class_indices.json"), "w") as f:
        json.dump(indices_map, f, indent=2)
    print("[INFO] Saved class indices mapping.")

    # 2. Calculate Class Weights to prevent Kuchipudi/Kathak imbalance
    class_counts = {}
    for cls_name in class_names:
        cls_path = os.path.join(DATASET_DIR, cls_name)
        class_counts[cls_name] = len(os.listdir(cls_path)) if os.path.exists(cls_path) else 1
    
    total_samples = sum(class_counts.values())
    class_weights = {}
    for i, cls_name in enumerate(class_names):
        count = class_counts[cls_name]
        class_weights[i] = total_samples / (num_classes * count)
        print(f"  -> Class '{cls_name}' ({count} images) => Weight: {class_weights[i]:.2f}")

    # 3. Optimize datasets for performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_dataset = train_dataset.prefetch(buffer_size=AUTOTUNE)
    val_dataset = val_dataset.prefetch(buffer_size=AUTOTUNE)

    # 4. Advanced Augmentation Pipeline
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip('horizontal'),
        tf.keras.layers.RandomRotation(0.15),
        tf.keras.layers.RandomZoom(0.15),
        tf.keras.layers.RandomTranslation(0.1, 0.1),
        tf.keras.layers.RandomContrast(0.1),
    ])

    # 5. Build Model (MobileNetV2 Base)
    print("[INFO] Building transfer learning architecture...")
    preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input
    
    base_model = MobileNetV2(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze for Stage 1

    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = data_augmentation(inputs)
    x = preprocess_input(x)
    x = base_model(x, training=False)
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    outputs = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs, outputs)

    # Compile Initial Stage
    model.compile(
        optimizer=Adam(learning_rate=INITIAL_LR),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=['accuracy']
    )

    # 6. Train Stage 1: Feature Extraction
    print(f"\n--- Stage 1: Training Classification Head ({INITIAL_EPOCHS} epochs) ---")
    history_stage1 = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=INITIAL_EPOCHS,
        class_weight=class_weights
    )

    # 7. Train Stage 2: Fine-Tuning Top Layers
    print(f"\n--- Stage 2: Fine-Tuning Top 40 Layers ({FINE_TUNE_EPOCHS} epochs) ---")
    base_model.trainable = True
    # Freeze all layers except top 40
    for layer in base_model.layers[:-40]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(learning_rate=FINE_TUNE_LR),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=['accuracy']
    )

    history_stage2 = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=TOTAL_EPOCHS,
        initial_epoch=INITIAL_EPOCHS,
        class_weight=class_weights
    )

    # 8. Save Model
    model_path = os.path.join(MODELS_DIR, "dance_classifier_v1.keras")
    model.save(model_path)
    print(f"\n[SUCCESS] Retrained model saved to: {model_path}")

    # Evaluate final validation performance
    val_loss, val_acc = model.evaluate(val_dataset, verbose=0)
    print(f"[METRIC] Final Balanced Validation Accuracy: {val_acc * 100:.2f}% | Loss: {val_loss:.4f}")

if __name__ == "__main__":
    train_model()
