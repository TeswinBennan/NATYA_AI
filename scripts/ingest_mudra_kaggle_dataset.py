import os
import shutil
import json
import glob
from typing import Dict, List, Any
import kagglehub

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_MUDRA_DATASET_DIR = os.path.join(BASE_DIR, "dataset", "kaggle_mudras")

def ingest_mudra_dataset():
    print("=" * 60)
    print("NATYA AI: BHARATANATYAM MUDRA DATASET INGESTION & CALIBRATION")
    print("=" * 60)
    
    print("\n[1/4] Checking/Downloading dataset via Kagglehub...")
    dataset_path = kagglehub.dataset_download("sowmithaasris/bharathanatyam-mudra-classification")
    print(f"Dataset cached at: {dataset_path}")
    
    os.makedirs(TARGET_MUDRA_DATASET_DIR, exist_ok=True)
    
    print("\n[2/4] Inspecting directory structure and classes...")
    categories = []
    total_images = 0
    class_stats = {}
    
    for item in sorted(os.listdir(dataset_path)):
        item_path = os.path.join(dataset_path, item)
        if os.path.isdir(item_path):
            img_files = glob.glob(os.path.join(item_path, "*.[jJ][pP][gG]")) + \
                        glob.glob(os.path.join(item_path, "*.[pP][nN][gG]")) + \
                        glob.glob(os.path.join(item_path, "*.[jJ][pP][eE][gG]"))
            categories.append(item)
            class_stats[item] = len(img_files)
            total_images += len(img_files)
            
    # Also check if images are in subfolders (e.g. train/test/val)
    if not categories:
        for root, dirs, files in os.walk(dataset_path):
            if files:
                rel = os.path.relpath(root, dataset_path)
                imgs = [f for f in files if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
                if imgs:
                    class_stats[rel] = len(imgs)
                    total_images += len(imgs)

    print(f"Discovered {len(class_stats)} classes with {total_images} total images:")
    for cls, count in list(class_stats.items())[:15]:
        print(f"  - {cls:30}: {count} samples")
    if len(class_stats) > 15:
        print(f"  ... and {len(class_stats) - 15} more classes.")

    # Save manifest
    manifest_path = os.path.join(TARGET_MUDRA_DATASET_DIR, "mudra_dataset_manifest.json")
    manifest_data = {
        "dataset_name": "sowmithaasris/bharathanatyam-mudra-classification",
        "source": "kaggle",
        "cached_path": dataset_path,
        "total_images": total_images,
        "classes": class_stats
    }
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
    print(f"\nManifest saved to: {manifest_path}")

    print("\n[3/4] Ingestion completed successfully.")

if __name__ == "__main__":
    ingest_mudra_dataset()
