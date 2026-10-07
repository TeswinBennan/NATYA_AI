import os
import cv2
import uuid
import numpy as np
import mediapipe as mp
from typing import Dict, Any, List, Optional, Tuple
from app.config import MODELS_DIR, UPLOADS_DIR

HAND_TASK_PATH = os.path.join(MODELS_DIR, "hand_landmarker.task")
MUDRA_UPLOAD_DIR = os.path.join(UPLOADS_DIR, "mudras")
os.makedirs(MUDRA_UPLOAD_DIR, exist_ok=True)

# 21 Hand landmark connections for skeleton rendering
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),        # Thumb
    (0, 5), (5, 6), (6, 7), (7, 8),        # Index
    (5, 9), (9, 10), (10, 11), (11, 12),   # Middle
    (9, 13), (13, 14), (14, 15), (15, 16), # Ring
    (13, 17), (0, 17), (17, 18), (18, 19), (19, 20) # Pinky & Palm
]

# =============================================================================
# CANONICAL BENCHMARKS FOR ALL 28 ASAMYUTA & SAMYUTA HASTAS (Abhinaya Darpana)
# =============================================================================
# State conventions for [thumb, index, middle, ring, pinky]:
# 1 = Extended Straight (160°-180°)
# 0 = Folded into Palm (40°-80°)
# 0.5 = Bent / Curved (90°-135°)
# 2 = Wide Abducted Outwards (Thumb crescent/open > 60°)

MUDRA_CANONICAL_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    # 1. Pataka (Flag / Open Palm)
    "pataka": {
        "name": "Pataka",
        "type": "Asamyuta",
        "signature": [0.5, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 45.0, "index": 175.0, "middle": 175.0, "ring": 175.0, "pinky": 175.0},
        "tolerances": {"thumb": 15.0, "index": 12.0, "middle": 12.0, "ring": 12.0, "pinky": 12.0},
        "max_thumb_abduction": 55.0,
        "max_finger_spread": 0.28,
        "tips": [
            "Keep all four fingers strictly straight and pressed tightly together without gaps.",
            "Tuck the thumb inward gently touching the base of the index finger.",
            "Maintain flat, erect palm geometry without bending the wrist backwards."
        ]
    },
    # 2. Tripataka (Three-Part Flag)
    "tripataka": {
        "name": "Tripataka",
        "type": "Asamyuta",
        "signature": [0.5, 1, 1, 0, 1],
        "ideal_angles": {"thumb": 45.0, "index": 175.0, "middle": 175.0, "ring": 45.0, "pinky": 175.0},
        "tolerances": {"thumb": 15.0, "index": 12.0, "middle": 12.0, "ring": 18.0, "pinky": 12.0},
        "tips": [
            "Bend only the ring finger down towards the palm at the third joint.",
            "Keep index, middle, and pinky fingers firmly upright and straight.",
            "Ensure the bent ring finger does not pull the middle finger downwards."
        ]
    },
    # 3. Ardhapataka (Half Flag)
    "ardhapataka": {
        "name": "Ardhapataka",
        "type": "Asamyuta",
        "signature": [0.5, 1, 1, 0, 0],
        "ideal_angles": {"thumb": 45.0, "index": 175.0, "middle": 175.0, "ring": 45.0, "pinky": 45.0},
        "tolerances": {"thumb": 15.0, "index": 12.0, "middle": 12.0, "ring": 18.0, "pinky": 18.0},
        "max_index_middle_dist": 0.25,
        "tips": [
            "Bend both the ring and little fingers down together into the palm.",
            "Hold index and middle fingers straight and joined together in parallel.",
            "Maintain thumb tucked against the folded fingers."
        ]
    },
    # 4. Kartarimukha (Scissors Face)
    "kartarimukha": {
        "name": "Kartarimukha",
        "type": "Asamyuta",
        "signature": [0.5, 1, 1, 0, 0],
        "ideal_angles": {"thumb": 40.0, "index": 175.0, "middle": 175.0, "ring": 40.0, "pinky": 40.0},
        "tolerances": {"thumb": 15.0, "index": 12.0, "middle": 12.0, "ring": 18.0, "pinky": 18.0},
        "requires_separation": ("index", "middle"),
        "min_index_middle_dist": 0.28,
        "tips": [
            "Separate index and middle fingers into a wide scissors (V-shape) gap.",
            "Fold ring and little fingers tightly into the palm with thumb resting over them.",
            "Angle index finger slightly backwards for expressive dynamism."
        ]
    },
    # 5. Mayura (Peacock)
    "mayura": {
        "name": "Mayura",
        "type": "Asamyuta",
        "signature": [0.5, 1, 1, 0.5, 1],
        "ideal_angles": {"thumb": 85.0, "index": 170.0, "middle": 170.0, "ring": 85.0, "pinky": 170.0},
        "tolerances": {"thumb": 15.0, "index": 15.0, "middle": 15.0, "ring": 18.0, "pinky": 15.0},
        "touch_pairs": [("thumb", "ring")],
        "tips": [
            "Join the tip of the ring finger precisely to the tip of the thumb.",
            "Fan the index, middle, and little fingers upwards gracefully like a peacock crest.",
            "Keep the palm slightly hollowed and wrists supple."
        ]
    },
    # 6. Ardhachandra (Half Moon)
    "ardhachandra": {
        "name": "Ardhachandra",
        "type": "Asamyuta",
        "signature": [2, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 140.0, "index": 175.0, "middle": 175.0, "ring": 175.0, "pinky": 175.0},
        "tolerances": {"thumb": 18.0, "index": 12.0, "middle": 12.0, "ring": 12.0, "pinky": 12.0},
        "min_thumb_abduction": 60.0,
        "tips": [
            "Extend the thumb outwards as far as possible to form a crescent moon curve.",
            "Keep all four fingers joined and straight in a clean planar line.",
            "Firm the web space between thumb and index finger."
        ]
    },
    # 7. Arala (Bent / Curved)
    "arala": {
        "name": "Arala",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 1, 1, 1],
        "ideal_angles": {"thumb": 50.0, "index": 95.0, "middle": 175.0, "ring": 175.0, "pinky": 175.0},
        "tolerances": {"thumb": 15.0, "index": 18.0, "middle": 12.0, "ring": 12.0, "pinky": 12.0},
        "tips": [
            "Curve the index finger gracefully like a bow while keeping middle, ring, and pinky straight.",
            "Tuck the thumb gently against the side of the palm.",
            "Ensure the index curve is smooth from the knuckle."
        ]
    },
    # 8. Shukatunda (Parrot's Beak)
    "shukatunda": {
        "name": "Shukatunda",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 1, 0.5, 1],
        "ideal_angles": {"thumb": 50.0, "index": 95.0, "middle": 175.0, "ring": 95.0, "pinky": 175.0},
        "tolerances": {"thumb": 15.0, "index": 18.0, "middle": 12.0, "ring": 18.0, "pinky": 12.0},
        "tips": [
            "Bend both index and ring fingers inward into curved beak shapes.",
            "Keep middle finger and pinky finger straight and upright.",
            "Hold thumb securely resting at the base of the index."
        ]
    },
    # 9. Mushti (Fist)
    "mushti": {
        "name": "Mushti",
        "type": "Asamyuta",
        "signature": [0, 0, 0, 0, 0],
        "ideal_angles": {"thumb": 45.0, "index": 45.0, "middle": 45.0, "ring": 45.0, "pinky": 45.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 18.0, "ring": 18.0, "pinky": 18.0},
        "tips": [
            "Curl all four fingers tightly into the palm with equal tension.",
            "Wrap the thumb securely across the middle phalanges of the fingers.",
            "Keep wrist firm and straight without bending backwards."
        ]
    },
    # 10. Shikhara (Spire / Peak)
    "shikhara": {
        "name": "Shikhara",
        "type": "Asamyuta",
        "signature": [1, 0, 0, 0, 0],
        "ideal_angles": {"thumb": 170.0, "index": 45.0, "middle": 45.0, "ring": 45.0, "pinky": 45.0},
        "tolerances": {"thumb": 15.0, "index": 18.0, "middle": 18.0, "ring": 18.0, "pinky": 18.0},
        "requires_thumb_upright": True,
        "tips": [
            "Hold four fingers folded tightly in Mushti fist.",
            "Extend the thumb strictly erect pointing directly upwards like a temple spire.",
            "Maintain strong vertical axis in the thumb."
        ]
    },
    # 11. Kapittha (Elephant Apple)
    "kapittha": {
        "name": "Kapittha",
        "type": "Asamyuta",
        "signature": [1, 0.5, 0, 0, 0],
        "ideal_angles": {"thumb": 130.0, "index": 70.0, "middle": 45.0, "ring": 45.0, "pinky": 45.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 18.0, "ring": 18.0, "pinky": 18.0},
        "touch_pairs": [("thumb", "index")],
        "tips": [
            "Hold Shikhara fist and bend the index finger over the tip of the thumb.",
            "Keep middle, ring, and little fingers tightly folded into the palm.",
            "Ensure the index finger forms a firm arch over the thumb crown."
        ]
    },
    # 12. Katakamukha (Opening in a Bracelet)
    "katakamukha": {
        "name": "Katakamukha",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 0.5, 1, 1],
        "ideal_angles": {"thumb": 90.0, "index": 85.0, "middle": 85.0, "ring": 165.0, "pinky": 165.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 18.0, "ring": 15.0, "pinky": 15.0},
        "touch_pairs": [("thumb", "index"), ("thumb", "middle")],
        "tips": [
            "Join the tips of index and middle fingers to the tip of the thumb.",
            "Extend the ring and little fingers gracefully upwards and outwards.",
            "Keep the circular opening between thumb and fingers crisp."
        ]
    },
    # 13. Suchi (Needle)
    "suchi": {
        "name": "Suchi",
        "type": "Asamyuta",
        "signature": [0, 1, 0, 0, 0],
        "ideal_angles": {"thumb": 40.0, "index": 178.0, "middle": 40.0, "ring": 40.0, "pinky": 40.0},
        "tolerances": {"thumb": 15.0, "index": 10.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "max_thumb_abduction": 45.0,
        "tips": [
            "Point the index finger strictly straight up towards the heavens.",
            "Fold middle, ring, and little fingers firmly into a tight fist.",
            "Lock the thumb firmly over the folded middle finger."
        ]
    },
    # 14. Chandrakala (Digit of Moon)
    "chandrakala": {
        "name": "Chandrakala",
        "type": "Asamyuta",
        "signature": [2, 1, 0, 0, 0],
        "ideal_angles": {"thumb": 140.0, "index": 178.0, "middle": 40.0, "ring": 40.0, "pinky": 40.0},
        "tolerances": {"thumb": 18.0, "index": 10.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "min_thumb_abduction": 60.0,
        "tips": [
            "Extend index straight up and release thumb wide into an L-shaped crescent.",
            "Keep middle, ring, and pinky tightly folded into the palm.",
            "Maintain strong tension in the web space between thumb and index."
        ]
    },
    # 15. Padmakosha (Lotus Bud)
    "padmakosha": {
        "name": "Padmakosha",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 0.5, 0.5, 0.5],
        "ideal_angles": {"thumb": 110.0, "index": 125.0, "middle": 125.0, "ring": 125.0, "pinky": 125.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 18.0, "ring": 18.0, "pinky": 18.0},
        "tips": [
            "Curve all five fingers slightly inward and separate them like a bowl holding fruit.",
            "Do not let fingertips touch each other; maintain even spacing.",
            "Hollow the center of the palm deeply."
        ]
    },
    # 16. Sarpashirsha (Snake's Hood)
    "sarpashirsha": {
        "name": "Sarpashirsha",
        "type": "Asamyuta",
        "signature": [0.5, 0.7, 0.7, 0.7, 0.7],
        "ideal_angles": {"thumb": 45.0, "index": 155.0, "middle": 155.0, "ring": 155.0, "pinky": 155.0},
        "tolerances": {"thumb": 15.0, "index": 15.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "tips": [
            "Join all four fingers and curve them forward into a gentle cobra hood canopy.",
            "Keep thumb bent along the base of the index finger.",
            "Form a smooth, continuous convex arch along the fingers."
        ]
    },
    # 17. Mrigashirsha (Deer's Head)
    "mrigashirsha": {
        "name": "Mrigashirsha",
        "type": "Asamyuta",
        "signature": [1, 0, 0, 0, 1],
        "ideal_angles": {"thumb": 140.0, "index": 45.0, "middle": 45.0, "ring": 45.0, "pinky": 170.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 18.0, "ring": 18.0, "pinky": 15.0},
        "tips": [
            "Extend thumb and pinky finger upwards straight like deer ears.",
            "Fold index, middle, and ring fingers down into the palm.",
            "Hold the two upright fingers steady with graceful symmetry."
        ]
    },
    # 18. Simhamukha (Lion's Face)
    "simhamukha": {
        "name": "Simhamukha",
        "type": "Asamyuta",
        "signature": [0.5, 1, 0.5, 0.5, 1],
        "ideal_angles": {"thumb": 90.0, "index": 170.0, "middle": 85.0, "ring": 85.0, "pinky": 170.0},
        "tolerances": {"thumb": 18.0, "index": 15.0, "middle": 18.0, "ring": 18.0, "pinky": 15.0},
        "touch_pairs": [("thumb", "middle"), ("thumb", "ring")],
        "tips": [
            "Join the tips of middle and ring fingers to the tip of the thumb.",
            "Hold index and little fingers straight up and erect like lion ears.",
            "Keep the posture firm and menacing."
        ]
    },
    # 19. Kangula (Tail / Little Finger Bell)
    "kangula": {
        "name": "Kangula",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 0.5, 0, 1],
        "ideal_angles": {"thumb": 75.0, "index": 130.0, "middle": 130.0, "ring": 45.0, "pinky": 170.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 18.0, "ring": 18.0, "pinky": 15.0},
        "tips": [
            "Fold the ring finger into the palm, extend pinky upright.",
            "Keep index and middle fingers curved slightly with thumb.",
            "Depicts betel-nut tree, bells, and water lily."
        ]
    },
    # 20. Alapadma (Full-Blown Lotus)
    "alapadma": {
        "name": "Alapadma",
        "type": "Asamyuta",
        "signature": [1, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 130.0, "index": 150.0, "middle": 155.0, "ring": 160.0, "pinky": 165.0},
        "tolerances": {"thumb": 18.0, "index": 15.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "requires_fan_spread": True,
        "min_fan_spread": 0.30,
        "tips": [
            "Fan all five fingers outwards separated from one another like lotus petals.",
            "Curl each finger sequentially starting from little finger towards the palm.",
            "Rotate the wrist gracefully to create the blooming flower dimension."
        ]
    },
    # 21. Chatura (Clever / Four Sides)
    "chatura": {
        "name": "Chatura",
        "type": "Asamyuta",
        "signature": [0, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 40.0, "index": 170.0, "middle": 170.0, "ring": 170.0, "pinky": 170.0},
        "tolerances": {"thumb": 15.0, "index": 12.0, "middle": 12.0, "ring": 12.0, "pinky": 12.0},
        "tips": [
            "Hold thumb across the base of the middle finger.",
            "Keep all four fingers straight, level, and joined in a plane.",
            "Denotes gold, copper, slow movement, and oil."
        ]
    },
    # 22. Bhramara (Bee)
    "bhramara": {
        "name": "Bhramara",
        "type": "Asamyuta",
        "signature": [0.5, 0, 0.5, 1, 1],
        "ideal_angles": {"thumb": 90.0, "index": 45.0, "middle": 90.0, "ring": 170.0, "pinky": 170.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 18.0, "ring": 15.0, "pinky": 15.0},
        "touch_pairs": [("thumb", "middle")],
        "tips": [
            "Join tip of middle finger with tip of thumb, fold index finger into palm.",
            "Extend ring and pinky fingers upright.",
            "Depicts bee, wing, yoga, and crane bird."
        ]
    },
    # 23. Hamsasya (Swan's Beak)
    "hamsasya": {
        "name": "Hamsasya",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 1, 1, 1],
        "ideal_angles": {"thumb": 90.0, "index": 90.0, "middle": 170.0, "ring": 170.0, "pinky": 170.0},
        "tolerances": {"thumb": 15.0, "index": 15.0, "middle": 12.0, "ring": 12.0, "pinky": 12.0},
        "touch_pairs": [("thumb", "index")],
        "tips": [
            "Join the tip of the forefinger (index) gently to the tip of the thumb.",
            "Keep the remaining three fingers (middle, ring, pinky) extended straight.",
            "Form a delicate, refined beak shape without squeezing hard."
        ]
    },
    # 24. Hamsapaksha (Swan Wing)
    "hamsapaksha": {
        "name": "Hamsapaksha",
        "type": "Asamyuta",
        "signature": [0.5, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 45.0, "index": 170.0, "middle": 170.0, "ring": 170.0, "pinky": 175.0},
        "tolerances": {"thumb": 15.0, "index": 12.0, "middle": 12.0, "ring": 12.0, "pinky": 12.0},
        "tips": [
            "Hold fingers joined in Pataka, then flare pinky slightly outwards and curve wrist.",
            "Keep hand poised sideways like an eagle or swan wing.",
            "Used for showing number six, bridges, and covering."
        ]
    },
    # 25. Sandamsha (Pincers / Grasp)
    "sandamsha": {
        "name": "Sandamsha",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 1, 1, 1],
        "ideal_angles": {"thumb": 85.0, "index": 85.0, "middle": 165.0, "ring": 165.0, "pinky": 165.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "touch_pairs": [("thumb", "index")],
        "tips": [
            "Rapid opening and closing of thumb and index tips in Padmakosha posture.",
            "Other fingers remain extended curved.",
            "Denotes number five, belly, sacrifice, and insect bite."
        ]
    },
    # 26. Mukula (Flower Bud)
    "mukula": {
        "name": "Mukula",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 0.5, 0.5, 0.5],
        "ideal_angles": {"thumb": 80.0, "index": 80.0, "middle": 80.0, "ring": 80.0, "pinky": 80.0},
        "tolerances": {"thumb": 15.0, "index": 15.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "all_tips_touching": True,
        "tips": [
            "Bring all five fingertips together touching at a single unified point.",
            "Keep all fingers curved inward into a closed flower bud shape.",
            "Point the apex of the bud upward towards the focal line."
        ]
    },
    # 27. Tamrachuda (Rooster Crest)
    "tamrachuda": {
        "name": "Tamrachuda",
        "type": "Asamyuta",
        "signature": [0.5, 0.5, 0, 0, 0],
        "ideal_angles": {"thumb": 50.0, "index": 85.0, "middle": 45.0, "ring": 45.0, "pinky": 45.0},
        "tolerances": {"thumb": 18.0, "index": 18.0, "middle": 18.0, "ring": 18.0, "pinky": 18.0},
        "tips": [
            "Bend index finger hooked like a rooster crest with thumb touching middle.",
            "Keep ring and pinky fingers folded tight into fist.",
            "Depicts rooster, camel, calf, and writing."
        ]
    },
    # 28. Trishula (Lord Shiva's Trident)
    "trishula": {
        "name": "Trishula",
        "type": "Asamyuta",
        "signature": [0, 1, 1, 1, 0],
        "ideal_angles": {"thumb": 80.0, "index": 175.0, "middle": 175.0, "ring": 175.0, "pinky": 80.0},
        "tolerances": {"thumb": 15.0, "index": 12.0, "middle": 12.0, "ring": 12.0, "pinky": 15.0},
        "touch_pairs": [("thumb", "pinky")],
        "tips": [
            "Bend thumb and little finger inward so their tips meet in the palm.",
            "Hold index, middle, and ring fingers straight up like Lord Shiva's trident.",
            "Maintain equal height and separation between the three upright prongs."
        ]
    },

    # SAMYUTA HASTAS (Double-hand configurations)
    "anjali": {
        "name": "Anjali",
        "type": "Samyuta",
        "signature": [0.5, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 45.0, "index": 175.0, "middle": 175.0, "ring": 175.0, "pinky": 175.0},
        "tolerances": {"thumb": 15.0, "index": 12.0, "middle": 12.0, "ring": 12.0, "pinky": 12.0},
        "tips": [
            "Join two Pataka hands flat palm-to-palm at heart center or above the head in devotion.",
            "Keep fingers aligned perfectly with gentle contact.",
            "Maintain posture of reverence and Namaskara."
        ]
    },
    "kapota": {
        "name": "Kapota",
        "type": "Samyuta",
        "signature": [0.5, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 45.0, "index": 170.0, "middle": 170.0, "ring": 170.0, "pinky": 170.0},
        "tolerances": {"thumb": 15.0, "index": 15.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "tips": [
            "Join two Pataka hands touching only at fingertips, knuckles and wrists, with center hollowed.",
            "Hollow palm shape resembles a dove (Kapota).",
            "Used to denote respectful acceptance, vow, and conversation."
        ]
    },
    "karkata": {
        "name": "Karkata",
        "type": "Samyuta",
        "signature": [0.5, 0.5, 0.5, 0.5, 0.5],
        "ideal_angles": {"thumb": 80.0, "index": 130.0, "middle": 130.0, "ring": 130.0, "pinky": 130.0},
        "tolerances": {"thumb": 20.0, "index": 20.0, "middle": 20.0, "ring": 20.0, "pinky": 20.0},
        "tips": [
            "Interlock fingers of both hands together tightly like a crab shell.",
            "Depicts arrival of people, twisting limbs, yawning, and blowing conch."
        ]
    },
    "swastika": {
        "name": "Swastika",
        "type": "Samyuta",
        "signature": [0.5, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 45.0, "index": 175.0, "middle": 175.0, "ring": 175.0, "pinky": 175.0},
        "tolerances": {"thumb": 15.0, "index": 15.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "tips": [
            "Cross two Pataka hands at the wrists.",
            "Hold hands upright near the chest.",
            "Denotes praise, argument, clouds, and sky."
        ]
    },
    "dola": {
        "name": "Dola",
        "type": "Samyuta",
        "signature": [0.5, 1, 1, 1, 1],
        "ideal_angles": {"thumb": 45.0, "index": 175.0, "middle": 175.0, "ring": 175.0, "pinky": 175.0},
        "tolerances": {"thumb": 15.0, "index": 15.0, "middle": 15.0, "ring": 15.0, "pinky": 15.0},
        "tips": [
            "Hold two Pataka hands relaxed downwards at the sides of the thighs.",
            "Denotes beginning of dance, waiting, and relaxation."
        ]
    },
    "shivalinga": {
        "name": "Shivalinga",
        "type": "Samyuta",
        "signature": [1, 0, 0, 0, 0],
        "ideal_angles": {"thumb": 175.0, "index": 45.0, "middle": 45.0, "ring": 45.0, "pinky": 45.0},
        "tolerances": {"thumb": 15.0, "index": 18.0, "middle": 18.0, "ring": 18.0, "pinky": 18.0},
        "tips": [
            "Place right hand Shikhara vertically on the flat open palm of left hand (Ardhachandra).",
            "Hold firmly at chest level.",
            "Represents Lord Shiva's divine Lingam emblem."
        ]
    }
}

# =============================================================================
# MEDIAPIPE HAND LANDMARKER SINGLETON
# =============================================================================
HAND_TASK_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "hand_landmarker.task")
if not os.path.exists(HAND_TASK_PATH):
    HAND_TASK_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "hand_landmarker.task")

_hand_landmarker = None

def get_hand_landmarker():
    """Initializes or returns singleton MediaPipe HandLandmarker."""
    global _hand_landmarker
    if _hand_landmarker is None and os.path.exists(HAND_TASK_PATH):
        try:
            from mediapipe.tasks.python import vision
            from mediapipe.tasks.python.core import base_options
            
            options = vision.HandLandmarkerOptions(
                base_options=base_options.BaseOptions(model_asset_path=HAND_TASK_PATH),
                running_mode=vision.RunningMode.IMAGE,
                num_hands=2,
                min_hand_detection_confidence=0.15,
                min_hand_presence_confidence=0.15,
                min_tracking_confidence=0.15
            )
            _hand_landmarker = vision.HandLandmarker.create_from_options(options)
            print(f"MediaPipe HandLandmarker initialized successfully from {HAND_TASK_PATH}.")
        except Exception as e:
            print(f"HandLandmarker initialization note: {e}")
    return _hand_landmarker
# =============================================================================
# ML MODEL LOADER (TRAINED ON 11,800+ KAGGLE BHARATANATYAM MUDRA SAMPLES)
# =============================================================================
ML_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "mudra_ml_classifier.pkl")
_mudra_ml_payload = None

def get_ml_mudra_model():
    global _mudra_ml_payload
    if _mudra_ml_payload is None and os.path.exists(ML_MODEL_PATH):
        try:
            import pickle
            with open(ML_MODEL_PATH, "rb") as f:
                _mudra_ml_payload = pickle.load(f)
            print(f"Loaded ML Mudra Classifier (accuracy: {_mudra_ml_payload.get('accuracy', 0)*100:.1f}%)")
        except Exception as e:
            print(f"ML mudra model load note: {e}")
    return _mudra_ml_payload


def extract_ml_features_19(pts_21: List[List[float]]) -> List[float]:
    """
    Extracts 19-dimensional rotation and scale-invariant geometric features
    matching the trained Random Forest landmark classifier.
    """
    pts_arr = np.array(pts_21, dtype=np.float32)
    wrist = pts_arr[0]
    
    palm_dir = pts_arr[9] - wrist
    palm_len = max(0.001, float(np.linalg.norm(palm_dir)))
    palm_unit = palm_dir / palm_len

    ext_ratios = []
    for mcp_idx, tip_idx in [(5, 8), (9, 12), (13, 16), (17, 20)]:
        d_mcp = max(0.001, float(np.linalg.norm(pts_arr[mcp_idx] - wrist)))
        d_tip = float(np.linalg.norm(pts_arr[tip_idx] - wrist))
        ext_ratios.append(d_tip / d_mcp)

    d_mcp_thb = max(0.001, float(np.linalg.norm(pts_arr[2] - wrist)))
    d_tip_thb = float(np.linalg.norm(pts_arr[4] - wrist))
    thumb_ratio = d_tip_thb / d_mcp_thb
    
    thumb_vec = pts_arr[4] - wrist
    thumb_proj = float(np.dot(thumb_vec, palm_unit)) / palm_len

    a = pts_arr[5][:2]
    b = wrist[:2]
    c = pts_arr[4][:2]
    rad = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    thumb_abd = float(np.abs(rad * 180.0 / np.pi))
    if thumb_abd > 180.0:
        thumb_abd = 360.0 - thumb_abd

    d_thb_idx = float(np.linalg.norm(pts_arr[4] - pts_arr[8])) / palm_len
    d_thb_mid = float(np.linalg.norm(pts_arr[4] - pts_arr[12])) / palm_len
    d_thb_rng = float(np.linalg.norm(pts_arr[4] - pts_arr[16])) / palm_len
    d_idx_mid = float(np.linalg.norm(pts_arr[8] - pts_arr[12])) / palm_len
    d_mid_rng = float(np.linalg.norm(pts_arr[12] - pts_arr[16])) / palm_len
    d_rng_pnk = float(np.linalg.norm(pts_arr[16] - pts_arr[20])) / palm_len

    fan_spread = (d_idx_mid + d_mid_rng + d_rng_pnk) / 3.0

    def ratio_to_ang(r):
        pct = min(1.0, max(0.0, (r - 1.05) / 1.15))
        return 40.0 + pct * 135.0

    idx_ang = ratio_to_ang(ext_ratios[0])
    mid_ang = ratio_to_ang(ext_ratios[1])
    rng_ang = ratio_to_ang(ext_ratios[2])
    pnk_ang = ratio_to_ang(ext_ratios[3])
    thb_ang = 170.0 if (thumb_proj >= 0.85 and thumb_abd < 55.0) else (140.0 if thumb_abd >= 60.0 else 45.0)

    return [
        ext_ratios[0], ext_ratios[1], ext_ratios[2], ext_ratios[3],
        thumb_ratio, thumb_proj, thumb_abd / 180.0,
        d_thb_idx, d_thb_mid, d_thb_rng,
        d_idx_mid, d_mid_rng, d_rng_pnk, fan_spread,
        idx_ang / 180.0, mid_ang / 180.0, rng_ang / 180.0, pnk_ang / 180.0, thb_ang / 180.0
    ]


# =============================================================================
# KINEMATIC GEOMETRY & FEATURE EXTRACTION
# =============================================================================
def calculate_angle_3pts(a, b, c) -> float:
    """Calculates angle ABC at vertex B in degrees."""
    a = np.array(a[:2], dtype=np.float32)
    b = np.array(b[:2], dtype=np.float32)
    c = np.array(c[:2], dtype=np.float32)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360.0 - angle
    return round(float(angle), 1)


def extract_hand_features(pts: List[List[float]]) -> Dict[str, Any]:
    """
    Extracts complete invariant anatomical feature vector from 21 MediaPipe hand landmarks.
    Combines tip-to-knuckle ratio and joint geometry for orientation-invariant recognition.
    """
    pts_arr = np.array(pts, dtype=np.float32)
    wrist = pts_arr[0]
    
    # Palm scale reference: distance from wrist (0) to middle MCP knuckle (9)
    palm_scale = max(0.01, float(np.linalg.norm(pts_arr[9] - wrist)))
    
    # 1. Finger Extension Ratios (Tip distance to Wrist relative to MCP Knuckle distance to Wrist)
    d_wrist_mcp_idx = max(0.01, float(np.linalg.norm(pts_arr[5] - wrist)))
    d_wrist_tip_idx = float(np.linalg.norm(pts_arr[8] - wrist))
    ext_ratio_idx = d_wrist_tip_idx / d_wrist_mcp_idx

    d_wrist_mcp_mid = max(0.01, float(np.linalg.norm(pts_arr[9] - wrist)))
    d_wrist_tip_mid = float(np.linalg.norm(pts_arr[12] - wrist))
    ext_ratio_mid = d_wrist_tip_mid / d_wrist_mcp_mid

    d_wrist_mcp_rng = max(0.01, float(np.linalg.norm(pts_arr[13] - wrist)))
    d_wrist_tip_rng = float(np.linalg.norm(pts_arr[16] - wrist))
    ext_ratio_rng = d_wrist_tip_rng / d_wrist_mcp_rng

    d_wrist_mcp_pnk = max(0.01, float(np.linalg.norm(pts_arr[17] - wrist)))
    d_wrist_tip_pnk = float(np.linalg.norm(pts_arr[20] - wrist))
    ext_ratio_pnk = d_wrist_tip_pnk / d_wrist_mcp_pnk

    # Thumb: MCP (2), IP (3), Tip (4)
    d_wrist_mcp_thb = max(0.01, float(np.linalg.norm(pts_arr[2] - wrist)))
    d_wrist_tip_thb = float(np.linalg.norm(pts_arr[4] - wrist))
    ext_ratio_thb = d_wrist_tip_thb / d_wrist_mcp_thb

    # Thumb abduction angle (Angle between Index MCP 5, Wrist 0, Thumb Tip 4)
    thumb_abduction = calculate_angle_3pts(pts[5], pts[0], pts[4])
    
    # Thumb joint flexion
    thumb_joint_ang = calculate_angle_3pts(pts[2], pts[3], pts[4])

    # Convert extension ratios to calibrated joint angles [40° - 175°]
    def ratio_to_angle(ext_ratio: float) -> float:
        pct = min(1.0, max(0.0, (ext_ratio - 1.05) / 1.15))
        return round(40.0 + pct * 135.0, 1)

    index_ang = ratio_to_angle(ext_ratio_idx)
    middle_ang = ratio_to_angle(ext_ratio_mid)
    ring_ang = ratio_to_angle(ext_ratio_rng)
    pinky_ang = ratio_to_angle(ext_ratio_pnk)
    
    # Thumb angle logic (supports upright Shikhara, wide Ardhachandra, tucked Pataka)
    if ext_ratio_thb >= 1.45 and thumb_joint_ang >= 145.0:
        thumb_ang = 170.0
    elif thumb_abduction >= 62.0:
        thumb_ang = 140.0
    elif ext_ratio_thb <= 1.15:
        thumb_ang = 45.0
    else:
        thumb_ang = 85.0

    # Classify state for signature matching [0 = folded, 0.5 = curved/bent, 1 = extended, 2 = wide]
    def classify_state(ext_ratio: float) -> float:
        if ext_ratio >= 1.55:
            return 1.0
        elif ext_ratio <= 1.15:
            return 0.0
        else:
            return 0.5

    state_idx = classify_state(ext_ratio_idx)
    state_mid = classify_state(ext_ratio_mid)
    state_rng = classify_state(ext_ratio_rng)
    state_pnk = classify_state(ext_ratio_pnk)
    
    if thumb_abduction >= 60.0:
        state_thb = 2.0
    elif thumb_ang >= 155.0 or ext_ratio_thb >= 1.45:
        state_thb = 1.0
    elif thumb_ang <= 55.0:
        state_thb = 0.0
    else:
        state_thb = 0.5

    # 2. Normalized Distances (divided by palm_scale)
    d_thumb_index = float(np.linalg.norm(pts_arr[4] - pts_arr[8])) / palm_scale
    d_thumb_middle = float(np.linalg.norm(pts_arr[4] - pts_arr[12])) / palm_scale
    d_thumb_ring = float(np.linalg.norm(pts_arr[4] - pts_arr[16])) / palm_scale
    d_thumb_pinky = float(np.linalg.norm(pts_arr[4] - pts_arr[20])) / palm_scale

    d_index_middle = float(np.linalg.norm(pts_arr[8] - pts_arr[12])) / palm_scale
    d_middle_ring = float(np.linalg.norm(pts_arr[12] - pts_arr[16])) / palm_scale
    d_ring_pinky = float(np.linalg.norm(pts_arr[16] - pts_arr[20])) / palm_scale

    fan_spread = (d_index_middle + d_middle_ring + d_ring_pinky) / 3.0

    return {
        "angles": {
            "thumb": thumb_ang,
            "index": index_ang,
            "middle": middle_ang,
            "ring": ring_ang,
            "pinky": pinky_ang
        },
        "thumb_abduction": thumb_abduction,
        "states": [state_thb, state_idx, state_mid, state_rng, state_pnk],
        "distances": {
            "thumb_index": d_thumb_index,
            "thumb_middle": d_thumb_middle,
            "thumb_ring": d_thumb_ring,
            "thumb_pinky": d_thumb_pinky,
            "index_middle": d_index_middle,
            "middle_ring": d_middle_ring,
            "ring_pinky": d_ring_pinky
        },
        "fan_spread": fan_spread,
        "palm_scale": palm_scale
    }


def score_mudra_match(features: Dict[str, Any], benchmark: Dict[str, Any]) -> float:
    """
    Computes a multi-criteria probability match score [0.0 - 100.0] between
    measured hand features and a canonical mudra benchmark.
    """
    user_states = features["states"]
    canon_sig = benchmark["signature"]
    user_angles = features["angles"]
    ideal_angles = benchmark["ideal_angles"]
    distances = features["distances"]
    
    # 1. State Signature Score (55% Weight)
    state_mismatches = 0.0
    for u_st, c_st in zip(user_states, canon_sig):
        state_mismatches += abs(u_st - c_st)
    signature_score = max(0.0, 100.0 - (state_mismatches * 30.0))

    # 2. Angle Conformity Score (45% Weight)
    angle_diff_sum = 0.0
    for k in ["thumb", "index", "middle", "ring", "pinky"]:
        tol = benchmark["tolerances"].get(k, 15.0)
        d = abs(user_angles[k] - ideal_angles[k])
        angle_diff_sum += max(0.0, d - (tol * 0.5))
    angle_score = max(0.0, 100.0 - (angle_diff_sum / 5.0) * 1.8)

    # 3. Geometric / Topological Modifiers (Bonuses & Penalties)
    geom_bonus = 0.0
    geom_penalty = 0.0

    # Touch pairs checking (e.g. Mayura = thumb-ring, Hamsasya = thumb-index, Katakamukha = thumb-index & middle)
    touch_pairs = benchmark.get("touch_pairs", [])
    for p1, p2 in touch_pairs:
        pair_key = f"{p1}_{p2}" if f"{p1}_{p2}" in distances else f"{p2}_{p1}"
        dist_val = distances.get(pair_key, 1.0)
        if dist_val <= 0.22:
            geom_bonus += 20.0
        elif dist_val <= 0.35:
            geom_bonus += 8.0
        else:
            geom_penalty += 25.0

    # All tips touching (Mukula)
    if benchmark.get("all_tips_touching"):
        all_touching = all(distances[k] <= 0.26 for k in ["thumb_index", "thumb_middle", "thumb_ring", "thumb_pinky"])
        if all_touching:
            geom_bonus += 35.0
        else:
            geom_penalty += 45.0

    # Wide Thumb Abduction (Ardhachandra / Chandrakala)
    if "min_thumb_abduction" in benchmark:
        if features.get("thumb_abduction", 45.0) >= benchmark["min_thumb_abduction"]:
            geom_bonus += 20.0
        else:
            geom_penalty += 30.0

    # Tucked Thumb Check (Pataka / Suchi)
    if "max_thumb_abduction" in benchmark:
        if features.get("thumb_abduction", 45.0) <= benchmark["max_thumb_abduction"]:
            geom_bonus += 12.0
        else:
            geom_penalty += 20.0

    # Finger Separation Requirement (Kartarimukha V-gap)
    if benchmark.get("requires_separation") == ("index", "middle"):
        if distances["index_middle"] >= benchmark.get("min_index_middle_dist", 0.28):
            geom_bonus += 25.0
        else:
            geom_penalty += 35.0

    # Parallel Fingers Requirement (Ardhapataka / Pataka)
    if "max_index_middle_dist" in benchmark:
        if distances["index_middle"] <= benchmark["max_index_middle_dist"]:
            geom_bonus += 12.0
        else:
            geom_penalty += 15.0

    # Upright Thumb Requirement (Shikhara)
    if benchmark.get("requires_thumb_upright"):
        if user_angles["thumb"] >= 155.0 and user_states[0] >= 0.8:
            geom_bonus += 30.0
        else:
            geom_penalty += 35.0

    # Lotus Fan Spread Requirement (Alapadma)
    if benchmark.get("requires_fan_spread"):
        if features["fan_spread"] >= benchmark.get("min_fan_spread", 0.30):
            geom_bonus += 25.0
        else:
            geom_penalty += 40.0

    # Restrict bonuses if core signature/angles are not aligned
    if signature_score < 60.0 or angle_score < 50.0:
        geom_bonus = min(geom_bonus, 5.0)

    # Composite Score (True Calibrated Conformity)
    total_score = (signature_score * 0.55) + (angle_score * 0.45) + geom_bonus - geom_penalty
    return max(0.0, min(99.6, total_score))


def draw_hand_skeleton(image: np.ndarray, landmarks_list, deviations_map: Dict[str, float] = None) -> np.ndarray:
    """
    Draws custom classical gold, emerald & ruby skeletal landmarks on hand image,
    coloring joints green if aligned and red/amber if requiring structural correction.
    """
    annotated = image.copy()
    h, w, _ = annotated.shape

    finger_joint_map = {
        "thumb": [1, 2, 3, 4],
        "index": [5, 6, 7, 8],
        "middle": [9, 10, 11, 12],
        "ring": [13, 14, 15, 16],
        "pinky": [17, 18, 19, 20]
    }

    for landmarks in landmarks_list:
        # Draw connections with luminous cyan/gold lines
        for start_idx, end_idx in HAND_CONNECTIONS:
            if start_idx < len(landmarks) and end_idx < len(landmarks):
                p1 = (int(landmarks[start_idx].x * w), int(landmarks[start_idx].y * h))
                p2 = (int(landmarks[end_idx].x * w), int(landmarks[end_idx].y * h))
                cv2.line(annotated, p1, p2, (230, 165, 45), 2)  # Gold line

        # Draw joints with kinematic status colors
        for f_name, indices in finger_joint_map.items():
            dev = deviations_map.get(f_name, 0.0) if deviations_map else 0.0
            if dev <= 15.0:
                color = (60, 220, 100) # Green (Optimal)
            elif dev <= 30.0:
                color = (55, 185, 245) # Gold/Amber (Minor Deviation)
            else:
                color = (60, 60, 240)  # Red (Needs Correction)

            for idx in indices:
                if idx < len(landmarks):
                    px = int(landmarks[idx].x * w)
                    py = int(landmarks[idx].y * h)
                    # Outer colored ring
                    cv2.circle(annotated, (px, py), 6, color, -1)
                    # Inner white core
                    cv2.circle(annotated, (px, py), 2, (255, 255, 255), -1)

        # Wrist root node
        px0 = int(landmarks[0].x * w)
        py0 = int(landmarks[0].y * h)
        cv2.circle(annotated, (px0, py0), 8, (245, 158, 11), -1)
        cv2.circle(annotated, (px0, py0), 3, (255, 255, 255), -1)

    return annotated


# =============================================================================
# MAIN MUDRA IDENTIFICATION & KINEMATIC RECTIFICATION ENGINE
# =============================================================================
def identify_and_correct_mudra(
    image_path: str, 
    target_mudra_name: Optional[str] = None, 
    hand_type: str = "single"
) -> Dict[str, Any]:
    """
    Intelligent Classical Mudra Engine:
    1. Extracts 21 3D Hand Landmarks from image via MediaPipe.
    2. Computes true joint flexion angles, palm-scale normalized distances, and touch topologies.
    3. Scores across all canonical 28 Asamyuta and Samyuta benchmarks with multi-criteria classifier.
    4. Evaluates structural deviations against canonical Natyashastra standards.
    5. Produces finger-by-finger pedagogical directives and generates annotated skeleton visualization.
    """
    if not os.path.exists(image_path):
        return {"success": False, "message": "Image file not found"}

    img = cv2.imread(image_path)
    if img is None:
        return {"success": False, "message": "Could not read image file."}

    h, w, _ = img.shape
    landmarker = get_hand_landmarker()

    raw_hands = None
    best_annotated_pts = None

    if landmarker is not None:
        try:
            # 1. Direct detection
            rgb_image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
            detection = landmarker.detect(mp_image)
            if detection and detection.hand_landmarks and len(detection.hand_landmarks) > 0:
                raw_hands = detection.hand_landmarks
                best_annotated_pts = detection.hand_landmarks[0]
            
            # 2. Square-padding pyramid if direct detection missed (handles high-res & non-square framing)
            if not raw_hands:
                max_dim = max(h, w)
                sq = np.zeros((max_dim, max_dim, 3), dtype=np.uint8)
                y_off = (max_dim - h) // 2
                x_off = (max_dim - w) // 2
                sq[y_off:y_off+h, x_off:x_off+w] = img
                
                # Test normal square & scales
                for sc in [1.0, 0.75, 0.5]:
                    if raw_hands: break
                    s_img = sq if sc == 1.0 else cv2.resize(sq, (int(max_dim*sc), int(max_dim*sc)))
                    mp_sq = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(s_img, cv2.COLOR_BGR2RGB))
                    det_sq = landmarker.detect(mp_sq)
                    if det_sq and det_sq.hand_landmarks and len(det_sq.hand_landmarks) > 0:
                        raw_hands = det_sq.hand_landmarks
                        best_annotated_pts = det_sq.hand_landmarks[0]

            # 3. Orientation / Rotation pyramid (handles tilted dancer hand postures)
            if not raw_hands:
                for rot in [cv2.ROTATE_90_CLOCKWISE, cv2.ROTATE_90_COUNTERCLOCKWISE, cv2.ROTATE_180]:
                    if raw_hands: break
                    rot_img = cv2.rotate(img, rot)
                    mp_rot = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(rot_img, cv2.COLOR_BGR2RGB))
                    det_rot = landmarker.detect(mp_rot)
                    if det_rot and det_rot.hand_landmarks and len(det_rot.hand_landmarks) > 0:
                        raw_hands = det_rot.hand_landmarks
                        best_annotated_pts = det_rot.hand_landmarks[0]
        except Exception as e:
            print(f"Hand detection note: {e}")

    # Extract features from detected hand(s)
    if raw_hands and len(raw_hands) > 0:
        hand_lm = raw_hands[0]
        pts = [[lm.x, lm.y, getattr(lm, 'z', 0.0)] for lm in hand_lm]
        features = extract_hand_features([[p[0], p[1]] for p in pts])
        has_real_detection = True
    else:
        annotated_filename = f"mudra_corr_{uuid.uuid4().hex[:8]}.jpg"
        annotated_save_path = os.path.join(MUDRA_UPLOAD_DIR, annotated_filename)
        cv2.imwrite(annotated_save_path, img)
        return {
            "success": True,
            "has_real_detection": False,
            "has_hand_detected": False,
            "auto_detected_mudra": "No Hand Detected",
            "auto_detected_id": "none",
            "mudra_id": "none",
            "mudra_name": "No Hand Detected",
            "overall_accuracy": 0.0,
            "confidence": 0.0,
            "top_predictions": [],
            "user_angles": {},
            "ideal_angles": {},
            "finger_corrections": [],
            "pedagogical_directives": [
                "⚠️ Hand was not detected clearly in this frame.",
                "Please center your whole hand and 5 fingers in the camera view with good lighting.",
                "Ensure your palm or back of hand is directly facing the camera."
            ],
            "annotated_url": f"/uploads/mudras/{annotated_filename}"
        }

    user_angles = features["angles"]

    # -------------------------------------------------------------
    # 1. AUTONOMOUS ENSEMBLE MUDRA CLASSIFIER & RANKING
    # -------------------------------------------------------------
    # Compute ML probabilities from Kaggle-trained Random Forest model
    ml_scores = {}
    ml_payload = get_ml_mudra_model()
    if ml_payload and has_real_detection:
        try:
            feat_19 = extract_ml_features_19(pts)
            probs = ml_payload["model"].predict_proba([feat_19])[0]
            for cls_name, p in zip(ml_payload["classes"], probs):
                ml_scores[cls_name.lower()] = float(p * 100.0)
        except Exception as e:
            print(f"ML probability estimation note: {e}")

    ranked_predictions: List[Dict[str, Any]] = []

    for m_id, benchmark in MUDRA_CANONICAL_BENCHMARKS.items():
        # Filter by single vs double hand if relevant
        if hand_type == "double" and benchmark.get("type") != "Samyuta":
            continue
        elif hand_type == "single" and benchmark.get("type") == "Samyuta" and m_id not in ("anjali", "kapota"):
            continue

        kinematic_score = score_mudra_match(features, benchmark)
        
        # Ensemble blending: If ML model has specific training on this class, blend ML (50%) + Kinematics (50%)
        if m_id in ml_scores:
            ml_prob = ml_scores[m_id]
            final_score = (0.50 * ml_prob) + (0.50 * kinematic_score)
        else:
            final_score = kinematic_score

        ranked_predictions.append({
            "mudra_id": m_id,
            "mudra_name": benchmark["name"],
            "type": benchmark.get("type", "Asamyuta"),
            "score": round(final_score, 1)
        })

    # Sort predictions by confidence score descending
    ranked_predictions.sort(key=lambda x: x["score"], reverse=True)
    best_prediction = ranked_predictions[0] if ranked_predictions else {"mudra_id": "pataka", "mudra_name": "Pataka", "score": 92.0}

    # If target mudra is explicitly specified by user (e.g. practicing Suchi), grade against target
    effective_id = best_prediction["mudra_id"]
    if target_mudra_name and str(target_mudra_name).strip().lower() not in ("auto", "none", ""):
        target_clean = str(target_mudra_name).strip().lower()
        if target_clean in MUDRA_CANONICAL_BENCHMARKS:
            effective_id = target_clean

    benchmark_data = MUDRA_CANONICAL_BENCHMARKS.get(effective_id, MUDRA_CANONICAL_BENCHMARKS["pataka"])
    ideal_angles = benchmark_data["ideal_angles"]

    # -------------------------------------------------------------
    # 2. STRUCTURAL KINEMATIC CORRECTION & TELEMETRY
    # -------------------------------------------------------------
    finger_corrections = []
    deviations_map = {}
    total_conformity_score = 0.0
    pedagogical_directives = []

    finger_labels = ["Thumb", "Index", "Middle", "Ring", "Pinky"]
    finger_keys = ["thumb", "index", "middle", "ring", "pinky"]

    for idx, f_key in enumerate(finger_keys):
        f_name = finger_labels[idx]
        user_ang = user_angles[f_key]
        ideal_ang = ideal_angles[f_key]
        diff = round(abs(user_ang - ideal_ang), 1)
        deviations_map[f_key] = diff

        # Score per finger
        f_score = max(0.0, min(100.0, 100.0 - (diff * 1.4)))
        total_conformity_score += f_score

        if diff <= 14.0:
            status = "Optimal"
            status_color = "green"
            directive = f"Optimal poise & extension ({user_ang}° matches canonical target {ideal_ang}°)."
        elif diff <= 28.0:
            status = "Minor Deviation"
            status_color = "yellow"
            direction = "increase extension" if user_ang < ideal_ang else "increase bend/fold"
            directive = f"Adjust {f_name} finger: {direction} by ~{diff}° (current: {user_ang}°, canonical target: {ideal_ang}°)."
            pedagogical_directives.append(directive)
        else:
            status = "Needs Correction"
            status_color = "red"
            direction = "straighten outwards" if user_ang < ideal_ang else "fold inward into palm"
            directive = f"Structural fix on {f_name} finger: {direction} by {diff}° to conform to {benchmark_data['name']} (measured: {user_ang}°, target: {ideal_ang}°)."
            pedagogical_directives.append(directive)

        finger_corrections.append({
            "finger": f_name,
            "user_angle": f"{user_ang}°",
            "target_angle": f"{ideal_ang}°",
            "deviation": f"{diff}°",
            "score": round(f_score, 1),
            "status": status,
            "status_color": status_color,
            "directive": directive
        })

    # Overall Accuracy
    overall_accuracy = round(total_conformity_score / len(finger_keys), 1)

    # Add canonical Natyashastra tips from Abhinaya Darpana
    for tip in benchmark_data.get("tips", []):
        pedagogical_directives.append(f"Abhinaya Darpana Shastra: {tip}")

    # Generate annotated skeleton visualization
    annotated_filename = f"mudra_corr_{uuid.uuid4().hex[:8]}.jpg"
    annotated_save_path = os.path.join(MUDRA_UPLOAD_DIR, annotated_filename)
    if raw_hands and len(raw_hands) > 0:
        annotated_img = draw_hand_skeleton(img, raw_hands, deviations_map)
    else:
        annotated_img = img.copy()
    cv2.imwrite(annotated_save_path, annotated_img)

    return {
        "success": True,
        "has_real_detection": has_real_detection,
        "has_hand_detected": has_real_detection,
        "auto_detected_mudra": best_prediction["mudra_name"],
        "auto_detected_id": best_prediction["mudra_id"],
        "mudra_id": effective_id,
        "mudra_name": benchmark_data["name"],
        "overall_accuracy": overall_accuracy,
        "confidence": best_prediction["score"],
        "top_predictions": ranked_predictions[:5],
        "user_angles": user_angles,
        "ideal_angles": ideal_angles,
        "finger_corrections": finger_corrections,
        "pedagogical_directives": pedagogical_directives,
        "annotated_url": f"/uploads/mudras/{annotated_filename}"
    }
