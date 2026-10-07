import os
import shutil
import uuid

def merge_datasets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_dir = os.path.join(base_dir, "dataset", "scraped_raw")
    kaggle_raw_dir = os.path.join(base_dir, "dataset", "kaggle_raw")
    combined_dir = os.path.join(base_dir, "dataset", "combined_raw")

    os.makedirs(combined_dir, exist_ok=True)

    needed_classes = ["bharatanatyam", "kathak", "kathakali", "kuchipudi", "mohiniyattam"]

    for cls in needed_classes:
        os.makedirs(os.path.join(combined_dir, cls), exist_ok=True)

    def copy_from_source(src_dir, source_name):
        if not os.path.exists(src_dir):
            print(f"Source {src_dir} not found. Skipping.")
            return

        for cls in needed_classes:
            cls_src = os.path.join(src_dir, cls)
            if not os.path.exists(cls_src):
                continue
                
            cls_dst = os.path.join(combined_dir, cls)
            files = os.listdir(cls_src)
            copied = 0
            for f in files:
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    ext = os.path.splitext(f)[1]
                    new_name = f"{source_name}_{uuid.uuid4().hex[:8]}{ext}"
                    shutil.copy2(os.path.join(cls_src, f), os.path.join(cls_dst, new_name))
                    copied += 1
            print(f"Copied {copied} images from {source_name}/{cls}")

    print("--- Copying from scraped raw dataset ---")
    copy_from_source(raw_dir, "scraped")

    print("--- Copying from kaggle raw dataset ---")
    copy_from_source(kaggle_raw_dir, "kaggle")

    print("\n--- Final Counts ---")
    for cls in needed_classes:
        cls_dst = os.path.join(combined_dir, cls)
        count = len(os.listdir(cls_dst)) if os.path.exists(cls_dst) else 0
        print(f"{cls}: {count} images")

if __name__ == "__main__":
    merge_datasets()
