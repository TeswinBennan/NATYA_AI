import os
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/knowledge", tags=["Classical Dance Knowledge & Lexicon"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
KAUMUDI_DIR = os.path.join(BASE_DIR, "dataset", "kaumudi_classical_dance")

# In-memory cached store
_KNOWLEDGE_CACHE: Dict[str, Any] = {}

def load_kaumudi_knowledge():
    """Parses and indexes all Kaumudi Classical Dance JSONL files into structured memory."""
    global _KNOWLEDGE_CACHE
    if _KNOWLEDGE_CACHE:
        return _KNOWLEDGE_CACHE

    if not os.path.exists(KAUMUDI_DIR):
        return {}

    manifest_path = os.path.join(KAUMUDI_DIR, "dataset_manifest.json")
    manifest = {}
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            pass

    knowledge = {
        "manifest": manifest,
        "forms": {
            "Bharatanatyam": {
                "adavus": [],
                "hastas": [],
                "nattuvangam": [],
                "choreography": [],
                "catalog": []
            },
            "Kuchipudi": {
                "adavus": [],
                "hastas": [],
                "tarangam": [],
                "scripts": [],
                "glossary": [],
                "scenes": [],
                "catalog": []
            },
            "Mohiniyattam": {
                "adavus": [],
                "hastas": [],
                "lasya_bhava": [],
                "padams": [],
                "video_poses": [],
                "costume": [],
                "catalog": []
            }
        },
        "all_records": []
    }

    # Helper to parse jsonl
    def parse_file(filename: str) -> List[dict]:
        fp = os.path.join(KAUMUDI_DIR, filename)
        records = []
        if os.path.exists(fp):
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            records.append(json.loads(line))
                        except Exception:
                            pass
        return records

    # 1. Bharatanatyam files
    knowledge["forms"]["Bharatanatyam"]["catalog"] = parse_file("bharatanatyam.jsonl")
    knowledge["forms"]["Bharatanatyam"]["adavus"] = parse_file("bharatanatyam_adavu_malayalam.jsonl")
    knowledge["forms"]["Bharatanatyam"]["hastas"] = parse_file("bharatanatyam_hasta_abhinaya_dictionary.jsonl")
    knowledge["forms"]["Bharatanatyam"]["nattuvangam"] = parse_file("bharatanatyam_nattuvangam_sollukattu.jsonl")
    knowledge["forms"]["Bharatanatyam"]["choreography"] = parse_file("bharatanatyam_video_choreography_annotations.jsonl")

    # 2. Kuchipudi files
    knowledge["forms"]["Kuchipudi"]["catalog"] = parse_file("kuchipudi.jsonl")
    knowledge["forms"]["Kuchipudi"]["adavus"] = parse_file("kuchipudi_adavu_hasta_lexicon.jsonl")
    knowledge["forms"]["Kuchipudi"]["scripts"] = parse_file("kuchipudi_dance_drama_scripts.jsonl")
    knowledge["forms"]["Kuchipudi"]["glossary"] = parse_file("kuchipudi_malayalam_glossary.jsonl")
    knowledge["forms"]["Kuchipudi"]["tarangam"] = parse_file("kuchipudi_taranga_dataset.jsonl")
    knowledge["forms"]["Kuchipudi"]["scenes"] = parse_file("kuchipudi_video_scene_annotations.jsonl")

    # 3. Mohiniyattam files
    knowledge["forms"]["Mohiniyattam"]["catalog"] = parse_file("mohiniyattam.jsonl")
    knowledge["forms"]["Mohiniyattam"]["adavus"] = parse_file("mohiniyattam_adavu_dataset.jsonl")
    knowledge["forms"]["Mohiniyattam"]["hastas"] = parse_file("mohiniyattam_hasta_lexicon.jsonl")
    knowledge["forms"]["Mohiniyattam"]["lasya_bhava"] = parse_file("mohiniyattam_lasya_bhava_labels.jsonl")
    knowledge["forms"]["Mohiniyattam"]["padams"] = parse_file("mohiniyattam_padams.jsonl")
    knowledge["forms"]["Mohiniyattam"]["video_poses"] = parse_file("mohiniyattam_video_pose_annotations.jsonl")

    _KNOWLEDGE_CACHE = knowledge
    return _KNOWLEDGE_CACHE

# Preload
try:
    load_kaumudi_knowledge()
except Exception as e:
    print(f"Kaumudi knowledge init note: {e}")

@router.get("/summary")
def get_knowledge_summary():
    """Returns overview of all integrated Kaumudi Kerala Classical Dance collections."""
    k = load_kaumudi_knowledge()
    summary = {}
    for form, collections in k.get("forms", {}).items():
        summary[form] = {
            col_name: len(items) for col_name, items in collections.items()
        }
    return {
        "source": "kaumudi-ai/kerala-classical-dance",
        "license": "CC-BY-4.0",
        "supported_forms": list(summary.keys()),
        "summary": summary
    }

@router.get("/details")
def get_dance_form_knowledge(
    dance_form: str = Query(..., description="Dance form (Bharatanatyam, Kuchipudi, Mohiniyattam, Kathak, Kathakali)")
):
    """Retrieves rich choreography, adavu taxonomy, and hasta dictionary for the given dance form."""
    k = load_kaumudi_knowledge()
    form_key = None
    for key in k.get("forms", {}).keys():
        if key.lower() == dance_form.lower():
            form_key = key
            break

    if not form_key:
        # Provide curated fallback for Kathak and Kathakali if not in Kaumudi repo
        if dance_form.lower() == "kathakali":
            return {
                "dance_form": "Kathakali",
                "source": "Natyaa AI Knowledge Base",
                "mudras": ["Pataka", "Mudrakhya", "Katakam", "Mushti", "Kartharimukham", "Hamsapaksham", "Sikharam", "Hamsasyam"],
                "elements": ["Navarasas (9 Expressions)", "Chuvadu (Steps)", "Kalasam (Pure Dance Units)", "Kacha Kettu (Costuming)"],
                "origin": "Kerala, India"
            }
        elif dance_form.lower() == "kathak":
            return {
                "dance_form": "Kathak",
                "source": "Natyaa AI Knowledge Base",
                "gharanas": ["Lucknow Gharana", "Jaipur Gharana", "Banaras Gharana", "Raigarh Gharana"],
                "elements": ["Tatkar (Rhythmic Footwork)", "Chakkars (Pirouettes)", "Toda & Tukra", "Abhinaya & Thumri"],
                "origin": "Northern India"
            }
        raise HTTPException(status_code=404, detail=f"No specific knowledge found for '{dance_form}'")

    return {
        "dance_form": form_key,
        "source": "kaumudi-ai/kerala-classical-dance",
        "collections": k["forms"][form_key]
    }
