import os
from bing_image_downloader import downloader

# Target configuration
IMAGES_PER_QUERY = 100
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset", "scraped_raw")

# New queries to bypass previous search history and grab fresh images
SEARCH_QUERIES = {
    "bharatanatyam": [
        "Bharatanatyam beautiful costume photography",
        "Bharatanatyam male dancer",
        "Bharatanatyam group performance",
        "Bharatanatyam thillana pose",
        "Indian temple Bharatanatyam"
    ],
    "kuchipudi": [
        "Kuchipudi brass plate dance",
        "Kuchipudi male dancer",
        "Kuchipudi group performance",
        "Kuchipudi traditional costume photography",
        "Indian temple Kuchipudi"
    ],
    "kathak": [
        "Kathak dancer anarkali dress",
        "Kathak footwork ghungroo",
        "Kathak group performance",
        "Kathak male dancer",
        "Kathak facial expressions"
    ],
    "kathakali": [
        "Kathakali dancer face makeup",
        "Kathakali costume traditional",
        "Kathakali performance full body",
        "Kathakali mudras hand gestures",
        "Kathakali green face painted"
    ],
    "mohiniyattam": [
        "Mohiniyattam beautiful dancer white saree",
        "Mohiniyattam traditional Kerala dance",
        "Mohiniyattam group performance",
        "Mohiniyattam facial expressions",
        "Mohiniyattam classical poses"
    ]
}

def download_dataset():
    print("=" * 60)
    print("NATYAA AI: MASS DATASET DOWNLOADER (ROUND 2)")
    print("=" * 60)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for dance_class, queries in SEARCH_QUERIES.items():
        print(f"\n--- Downloading for {dance_class.upper()} ---")
        target_folder = os.path.join(OUTPUT_DIR, dance_class)
        os.makedirs(target_folder, exist_ok=True)
        
        for query in queries:
            print(f"  -> Query: '{query}'")
            try:
                downloader.download(
                    query,
                    limit=IMAGES_PER_QUERY,
                    output_dir=OUTPUT_DIR,
                    adult_filter_off=False,
                    force_replace=False,
                    timeout=60,
                    verbose=False
                )
                
                query_folder = os.path.join(OUTPUT_DIR, query)
                if os.path.exists(query_folder):
                    for file in os.listdir(query_folder):
                        base, ext = os.path.splitext(file)
                        new_name = f"R2_{query.replace(' ', '_')}_{base}{ext}"
                        try:
                            os.rename(os.path.join(query_folder, file), os.path.join(target_folder, new_name))
                        except Exception as e:
                            pass
                    try:
                        os.rmdir(query_folder)
                    except:
                        pass
            except Exception as e:
                print(f"[ERROR] Failed query '{query}': {e}")
                
        print(f"[OK] Completed queries for {dance_class}.")

if __name__ == "__main__":
    download_dataset()
