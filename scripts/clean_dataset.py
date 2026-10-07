import os
import cv2

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset", "raw")
MIN_FILE_SIZE_KB = 5

def clean_dataset():
    print("=" * 60)
    print("NATYAA AI: DATASET CLEANER")
    print("=" * 60)

    if not os.path.exists(DATASET_DIR):
        print(f"[ERROR] Dataset directory not found: {DATASET_DIR}")
        return

    total_removed = 0
    total_kept = 0

    for class_name in os.listdir(DATASET_DIR):
        class_dir = os.path.join(DATASET_DIR, class_name)
        if not os.path.isdir(class_dir):
            continue

        removed_in_class = 0
        kept_in_class = 0

        for file_name in os.listdir(class_dir):
            file_path = os.path.join(class_dir, file_name)
            
            # Check file size
            try:
                size_kb = os.path.getsize(file_path) / 1024
                if size_kb < MIN_FILE_SIZE_KB:
                    os.remove(file_path)
                    removed_in_class += 1
                    continue
                
                # Check if it's a valid image using OpenCV
                img = cv2.imread(file_path)
                if img is None:
                    os.remove(file_path)
                    removed_in_class += 1
                    continue
                
                kept_in_class += 1
            except Exception as e:
                print(f"Error checking {file_path}: {e}")
                try:
                    os.remove(file_path)
                    removed_in_class += 1
                except:
                    pass

        print(f"[{class_name}] Kept: {kept_in_class} | Removed: {removed_in_class}")
        total_kept += kept_in_class
        total_removed += removed_in_class

    print("-" * 60)
    print(f"FINAL STATS: Kept {total_kept} images. Removed {total_removed} invalid images.")
    print("=" * 60)

if __name__ == "__main__":
    clean_dataset()
