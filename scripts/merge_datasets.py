import os
import shutil
from datasets import load_dataset
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
                    # Use unique names to prevent overwriting
                    ext = os.path.splitext(f)[1]
                    new_name = f"{source_name}_{uuid.uuid4().hex[:8]}{ext}"
                    shutil.copy2(os.path.join(cls_src, f), os.path.join(cls_dst, new_name))
                    copied += 1
            print(f"Copied {copied} images from {source_name}/{cls}")

    print("--- Copying from scraped raw dataset ---")
    copy_from_source(raw_dir, "scraped")

    print("--- Copying from kaggle raw dataset ---")
    copy_from_source(kaggle_raw_dir, "kaggle")

    print("--- Downloading and merging from HuggingFace dataset ---")
    try:
        ds = load_dataset("tanmaykm/indian_dance_forms")
        
        split_names = list(ds.keys())
        for split in split_names:
            split_ds = ds[split]
            features = split_ds.features
            
            label_names = []
            if 'label' in features and hasattr(features['label'], 'names'):
                label_names = features['label'].names
                
            for idx, item in enumerate(split_ds):
                # Ensure it has 'image' and 'label'
                if 'image' not in item or 'label' not in item:
                    continue
                    
                image = item['image']
                label_idx = item['label']
                
                # Try to get class string
                if label_names and isinstance(label_idx, int):
                    cls_name = label_names[label_idx].lower().strip()
                elif isinstance(label_idx, str):
                    cls_name = label_idx.lower().strip()
                else:
                    cls_name = str(label_idx).lower().strip()
                
                # Check if it matches our needed classes
                if cls_name not in needed_classes:
                    # Sometimes they use different spellings or prefixes
                    found = False
                    for needed in needed_classes:
                        if needed in cls_name:
                            cls_name = needed
                            found = True
                            break
                    if not found:
                        continue
                        
                # Save image
                cls_dst = os.path.join(combined_dir, cls_name)
                new_name = f"hf_{uuid.uuid4().hex[:8]}.jpg"
                save_path = os.path.join(cls_dst, new_name)
                try:
                    # image is a PIL.Image
                    image.convert('RGB').save(save_path, "JPEG")
                except Exception as e:
                    print(f"Error saving image: {e}")
                    
        print("HuggingFace dataset merged.")
    except Exception as e:
        print("Failed to load or merge HuggingFace dataset:", e)

    print("\n--- Final Counts ---")
    for cls in needed_classes:
        cls_dst = os.path.join(combined_dir, cls)
        count = len(os.listdir(cls_dst)) if os.path.exists(cls_dst) else 0
        print(f"{cls}: {count} images")

if __name__ == "__main__":
    merge_datasets()
