import os
import shutil
import kagglehub

def download_and_prepare_dataset():
    print("Downloading dataset using kagglehub...")
    # Download latest version
    path = kagglehub.dataset_download("aditya48/indian-dance-form-classification")
    print("Path to dataset files:", path)
    
import os
import shutil

def move_dataset():
    kaggle_path = r"C:\Users\ASUS\.cache\kagglehub\datasets\aditya48\indian-dance-form-classification\versions\3\train"
    target_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset", "kaggle_raw")
    
    os.makedirs(target_dir, exist_ok=True)
    
    needed_classes = ["bharatanatyam", "kathak", "kathakali", "kuchipudi", "mohiniyattam"]
    
    for cls in needed_classes:
        src = os.path.join(kaggle_path, cls)
        dst = os.path.join(target_dir, cls)
        if not os.path.exists(dst):
            print(f"Copying {cls}...")
            shutil.copytree(src, dst)
            print(f"Copied {len(os.listdir(dst))} images for {cls}.")
        else:
            print(f"{cls} already exists in target directory.")
            
if __name__ == "__main__":
    move_dataset()
