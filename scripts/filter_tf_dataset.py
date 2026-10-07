import os
import tensorflow as tf

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset", "raw")

def filter_tensorflow_images():
    print("=" * 60)
    print("NATYAA AI: TENSORFLOW DATASET FILTER")
    print("=" * 60)

    removed = 0
    total = 0

    for root, dirs, files in os.walk(DATASET_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            total += 1
            
            try:
                # Test if TensorFlow can decode it
                img_raw = tf.io.read_file(file_path)
                img = tf.io.decode_image(img_raw, channels=3, expand_animations=False)
                # Just evaluating it catches most errors
            except Exception as e:
                # If it fails, delete it
                print(f"[REMOVED] TF could not decode {file_path}")
                os.remove(file_path)
                removed += 1
                
    print("-" * 60)
    print(f"Scanned {total} images. Removed {removed} incompatible images.")
    print("=" * 60)

if __name__ == "__main__":
    filter_tensorflow_images()
