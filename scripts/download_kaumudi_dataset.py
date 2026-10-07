import os
import json
from huggingface_hub import hf_hub_download

REPO_ID = "kaumudi-ai/kerala-classical-dance"
REVISION = "ce68a4366fa2648f3ad78a2b5c09e740f56c0a11"

FILES = [
    "bharatanatyam.jsonl",
    "bharatanatyam_adavu_malayalam.jsonl",
    "bharatanatyam_hasta_abhinaya_dictionary.jsonl",
    "bharatanatyam_nattuvangam_sollukattu.jsonl",
    "bharatanatyam_video_choreography_annotations.jsonl",
    "kuchipudi.jsonl",
    "kuchipudi_adavu_hasta_lexicon.jsonl",
    "kuchipudi_dance_drama_scripts.jsonl",
    "kuchipudi_malayalam_glossary.jsonl",
    "kuchipudi_taranga_dataset.jsonl",
    "kuchipudi_video_scene_annotations.jsonl",
    "mohiniyattam.jsonl",
    "mohiniyattam_adavu_dataset.jsonl",
    "mohiniyattam_hasta_lexicon.jsonl",
    "mohiniyattam_lasya_bhava_labels.jsonl",
    "mohiniyattam_padams.jsonl",
    "mohiniyattam_video_pose_annotations.jsonl"
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST_DIR = os.path.join(BASE_DIR, "dataset", "kaumudi_classical_dance")
os.makedirs(DEST_DIR, exist_ok=True)

def main():
    print(f"Downloading Kaumudi Kerala Classical Dance dataset from HF...")
    summary = {}
    
    for fname in set(FILES):
        try:
            local_cache_path = hf_hub_download(
                repo_id=REPO_ID,
                filename=fname,
                revision=REVISION,
                repo_type="dataset"
            )
            dest_path = os.path.join(DEST_DIR, fname)
            
            # Read and copy
            records = []
            with open(local_cache_path, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            records.append(json.loads(line))
                        except:
                            pass
            
            # Save nicely to DEST_DIR
            with open(dest_path, "w", encoding="utf-8") as f:
                for r in records:
                    f.write(json.dumps(r, ensure_ascii=False) + "\n")
                    
            summary[fname] = {
                "records_count": len(records),
                "keys": list(records[0].keys()) if records else []
            }
            print(f"[OK] {fname}: {len(records)} records")
        except Exception as e:
            print(f"[ERROR] Failed {fname}: {e}")
            summary[fname] = {"error": str(e)}

    # Save summary manifest
    manifest_path = os.path.join(DEST_DIR, "dataset_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"\nSaved all files and manifest to: {DEST_DIR}")

if __name__ == "__main__":
    main()
