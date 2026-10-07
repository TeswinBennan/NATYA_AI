"""
NATYAA AI - Classical Indian Dance Reference Postures Library
Includes ideal angular benchmarks for Bharatanatyam, Kathakali, Kuchipudi, Kathak, and Mohiniyattam.
"""
import re

REFERENCE_POSES = {
    "Bharatanatyam": {
        "Aramandi (Ayata)": {
            "description": "Half-sitting fundamental stance with knees bent sideways, back straight, and heels together forming a triangle.",
            "ideal_angles": {
                "left_knee": 120.0,
                "right_knee": 120.0,
                "left_shoulder": 85.0,
                "right_shoulder": 85.0,
                "left_wrist": 170.0,
                "right_wrist": 170.0,
                "left_elbow": 140.0,
                "right_elbow": 140.0,
                "left_hip": 110.0,
                "right_hip": 110.0,
                "left_ankle": 105.0,
                "right_ankle": 105.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 14.0,
                "right_elbow": 14.0
            },
            "pedagogical_tips": [
                "Ensure knees point outward laterally away from each other.",
                "Maintain an erect spine without leaning forward.",
                "Keep arms curved gracefully at chest level with wrists held firm in Pataka/Tripataka."
            ]
        },
        "Natyarambha": {
            "description": "Classical opening stance with arms extended laterally at shoulder height in full graceful arc.",
            "ideal_angles": {
                "left_knee": 130.0,
                "right_knee": 130.0,
                "left_shoulder": 90.0,
                "right_shoulder": 90.0,
                "left_wrist": 175.0,
                "right_wrist": 175.0,
                "left_elbow": 160.0,
                "right_elbow": 160.0,
                "left_hip": 115.0,
                "right_hip": 115.0,
                "left_ankle": 110.0,
                "right_ankle": 110.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 10.0,
                "right_shoulder": 10.0,
                "left_wrist": 14.0,
                "right_wrist": 14.0,
                "left_elbow": 12.0,
                "right_elbow": 12.0
            },
            "pedagogical_tips": [
                "Keep elbows slightly curved at shoulder height, never fully locked.",
                "Shoulders should be relaxed and level.",
                "Wrists should remain aligned with the horizontal elbow line."
            ]
        },
        "Muzhumandi": {
            "description": "Full seated stance on toes with maximum lateral knee turnout.",
            "ideal_angles": {
                "left_knee": 60.0,
                "right_knee": 60.0,
                "left_shoulder": 80.0,
                "right_shoulder": 80.0,
                "left_wrist": 168.0,
                "right_wrist": 168.0,
                "left_elbow": 130.0,
                "right_elbow": 130.0,
                "left_hip": 65.0,
                "right_hip": 65.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 15.0,
                "right_elbow": 15.0
            },
            "pedagogical_tips": [
                "Keep back straight and weight balanced over the balls of the feet.",
                "Maintain lateral hip abduction and wrist poise."
            ]
        },
        "Alidha": {
            "description": "Dynamic heroic warrior archer lunge stance drawing the celestial bow.",
            "ideal_angles": {
                "left_knee": 165.0,
                "right_knee": 115.0,
                "left_shoulder": 90.0,
                "right_shoulder": 85.0,
                "left_wrist": 178.0,
                "right_wrist": 155.0,
                "left_elbow": 170.0,
                "right_elbow": 55.0,
                "left_hip": 130.0,
                "right_hip": 105.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 15.0,
                "right_elbow": 15.0
            },
            "pedagogical_tips": [
                "Lunge firmly into the bent knee while extending the rear leg straight.",
                "Extend lead bow arm straight while drawing rear elbow back to ear and flexing wrist."
            ]
        },
        "Samapada": {
            "description": "Upright serene standing stance with feet together and vertical axis.",
            "ideal_angles": {
                "left_knee": 175.0,
                "right_knee": 175.0,
                "left_shoulder": 75.0,
                "right_shoulder": 75.0,
                "left_wrist": 170.0,
                "right_wrist": 170.0,
                "left_elbow": 145.0,
                "right_elbow": 145.0,
                "left_hip": 175.0,
                "right_hip": 175.0
            },
            "tolerances": {
                "left_knee": 10.0,
                "right_knee": 10.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 15.0,
                "right_elbow": 15.0
            },
            "pedagogical_tips": ["Keep spine upright and head balanced centrally with steady wrists."]
        }
    },
    "Kathakali": {
        "Kalasam Basic": {
            "description": "Powerful heroic martial stance with wide outer foot turnout and 90° flexed elbows.",
            "ideal_angles": {
                "left_knee": 115.0,
                "right_knee": 115.0,
                "left_shoulder": 95.0,
                "right_shoulder": 95.0,
                "left_wrist": 165.0,
                "right_wrist": 165.0,
                "left_elbow": 90.0,
                "right_elbow": 90.0,
                "left_hip": 105.0,
                "right_hip": 105.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 12.0,
                "right_elbow": 12.0
            },
            "pedagogical_tips": [
                "Lower the pelvic center of gravity onto outer foot edges.",
                "Hold elbows firm and square at chest height with flexed wrists.",
                "Project the chest forward while keeping neck firmly aligned."
            ]
        },
        "Paccha Vinyasa": {
            "description": "Noble heroic avatar posture with elevated chest, Mudrakhya mudra, and steady gaze.",
            "ideal_angles": {
                "left_knee": 110.0,
                "right_knee": 110.0,
                "left_shoulder": 90.0,
                "right_shoulder": 90.0,
                "left_wrist": 160.0,
                "right_wrist": 160.0,
                "left_elbow": 95.0,
                "right_elbow": 95.0,
                "left_hip": 100.0,
                "right_hip": 100.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 12.0,
                "right_elbow": 12.0
            },
            "pedagogical_tips": [
                "Broaden the shoulders and maintain heroic Sattvika expression.",
                "Keep arms lifted and square to torso."
            ]
        },
        "Thoppi": {
            "description": "Wide classical stance with outward foot turnout and grounded pelvic anchor.",
            "ideal_angles": {
                "left_knee": 105.0,
                "right_knee": 105.0,
                "left_shoulder": 90.0,
                "right_shoulder": 90.0,
                "left_wrist": 165.0,
                "right_wrist": 165.0,
                "left_elbow": 90.0,
                "right_elbow": 90.0,
                "left_hip": 95.0,
                "right_hip": 95.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 12.0,
                "right_elbow": 12.0
            },
            "pedagogical_tips": ["Ground feet firmly and brace core."]
        }
    },
    "Kuchipudi": {
        "Tribhanga Stance": {
            "description": "The classic three-bend posture at neck, waist, and knee creating an S-curve body silhouette.",
            "ideal_angles": {
                "left_knee": 130.0,
                "right_knee": 145.0,
                "left_shoulder": 85.0,
                "right_shoulder": 90.0,
                "left_wrist": 165.0,
                "right_wrist": 160.0,
                "left_elbow": 135.0,
                "right_elbow": 145.0,
                "left_hip": 135.0,
                "right_hip": 160.0
            },
            "tolerances": {
                "left_knee": 14.0,
                "right_knee": 14.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 15.0,
                "right_elbow": 15.0
            },
            "pedagogical_tips": [
                "Accentuate the gentle lateral deflection of the hip.",
                "Counterbalance head tilt with shoulder orientation in graceful Alapadma."
            ]
        },
        "Ayatam": {
            "description": "Lyrical undulating torso posture grounded in demi-squat knee flexion.",
            "ideal_angles": {
                "left_knee": 128.0,
                "right_knee": 128.0,
                "left_shoulder": 85.0,
                "right_shoulder": 85.0,
                "left_wrist": 170.0,
                "right_wrist": 170.0,
                "left_elbow": 150.0,
                "right_elbow": 150.0,
                "left_hip": 115.0,
                "right_hip": 115.0
            },
            "tolerances": {
                "left_knee": 14.0,
                "right_knee": 14.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 14.0,
                "right_wrist": 14.0,
                "left_elbow": 14.0,
                "right_elbow": 14.0
            },
            "pedagogical_tips": [
                "Maintain grounded knee bend with supple, flowing torso wave."
            ]
        },
        "Manduka Shabdam": {
            "description": "Graceful dynamic crouching posture imitating the frog narrative rhythm.",
            "ideal_angles": {
                "left_knee": 90.0,
                "right_knee": 90.0,
                "left_shoulder": 80.0,
                "right_shoulder": 80.0,
                "left_wrist": 165.0,
                "right_wrist": 165.0,
                "left_elbow": 140.0,
                "right_elbow": 140.0,
                "left_hip": 85.0,
                "right_hip": 85.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 15.0,
                "right_elbow": 15.0
            },
            "pedagogical_tips": ["Maintain rhythmic readiness in the ankles and low crouch."]
        },
        "Tarangam": {
            "description": "Brass plate balance stance requiring central core poise and rhythmic feet.",
            "ideal_angles": {
                "left_knee": 135.0,
                "right_knee": 135.0,
                "left_shoulder": 85.0,
                "right_shoulder": 85.0,
                "left_wrist": 172.0,
                "right_wrist": 172.0,
                "left_elbow": 145.0,
                "right_elbow": 145.0,
                "left_hip": 120.0,
                "right_hip": 120.0
            },
            "tolerances": {
                "left_knee": 12.0,
                "right_knee": 12.0,
                "left_shoulder": 10.0,
                "right_shoulder": 10.0,
                "left_wrist": 12.0,
                "right_wrist": 12.0,
                "left_elbow": 12.0,
                "right_elbow": 12.0
            },
            "pedagogical_tips": ["Hold head still and maintain erect central gravity vector."]
        }
    },
    "Kathak": {
        "Samapada": {
            "description": "Upright vertical axis stance with serene posture, heels together, and poised shoulders.",
            "ideal_angles": {
                "left_knee": 175.0,
                "right_knee": 175.0,
                "left_shoulder": 80.0,
                "right_shoulder": 80.0,
                "left_wrist": 170.0,
                "right_wrist": 170.0,
                "left_elbow": 140.0,
                "right_elbow": 140.0,
                "left_hip": 175.0,
                "right_hip": 175.0
            },
            "tolerances": {
                "left_knee": 10.0,
                "right_knee": 10.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 14.0,
                "right_wrist": 14.0,
                "left_elbow": 14.0,
                "right_elbow": 14.0
            },
            "pedagogical_tips": [
                "Maintain vertical straight spine with gentle chest elevation.",
                "Keep hands at chest level or extended gracefully in Pataka."
            ]
        },
        "Tatkar Stance": {
            "description": "Grounded rhythmic footwork stance with arms bent at solar plexus and upright torso.",
            "ideal_angles": {
                "left_knee": 165.0,
                "right_knee": 165.0,
                "left_shoulder": 70.0,
                "right_shoulder": 70.0,
                "left_wrist": 160.0,
                "right_wrist": 160.0,
                "left_elbow": 100.0,
                "right_elbow": 100.0,
                "left_hip": 165.0,
                "right_hip": 165.0
            },
            "tolerances": {
                "left_knee": 10.0,
                "right_knee": 10.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 14.0,
                "right_wrist": 14.0,
                "left_elbow": 12.0,
                "right_elbow": 12.0
            },
            "pedagogical_tips": [
                "Weight evenly distributed across both feet ready for rhythmic Tatkar strikes.",
                "Keep arms tucked close to chest."
            ]
        },
        "Chakkar Dynamic": {
            "description": "Upright posture with arms forming a spiral path in readiness for fast pirouette turns.",
            "ideal_angles": {
                "left_knee": 160.0,
                "right_knee": 165.0,
                "left_shoulder": 85.0,
                "right_shoulder": 90.0,
                "left_wrist": 170.0,
                "right_wrist": 165.0,
                "left_elbow": 145.0,
                "right_elbow": 130.0,
                "left_hip": 165.0,
                "right_hip": 165.0
            },
            "tolerances": {
                "left_knee": 12.0,
                "right_knee": 12.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 14.0,
                "right_elbow": 14.0
            },
            "pedagogical_tips": [
                "Keep the vertical spinal axis completely straight for rotational stability.",
                "Engage the core and focus eyes toward the focal turning point."
            ]
        }
    },
    "Mohiniyattam": {
        "Andolika Sway": {
            "description": "Lyrical circular swaying posture reminiscent of Kerala palm trees and backwaters.",
            "ideal_angles": {
                "left_knee": 135.0,
                "right_knee": 135.0,
                "left_shoulder": 85.0,
                "right_shoulder": 85.0,
                "left_wrist": 165.0,
                "right_wrist": 165.0,
                "left_elbow": 135.0,
                "right_elbow": 135.0,
                "left_hip": 125.0,
                "right_hip": 125.0
            },
            "tolerances": {
                "left_knee": 15.0,
                "right_knee": 15.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 15.0,
                "right_elbow": 15.0
            },
            "pedagogical_tips": [
                "Ensure movements flow smoothly without abrupt jerks.",
                "Keep chest soft and shoulders relaxed in continuous torso figure-8 sway."
            ]
        },
        "Lasya Mandi": {
            "description": "Soft, rounded knee demi-flexion with gentle circular pelvic sway.",
            "ideal_angles": {
                "left_knee": 145.0,
                "right_knee": 145.0,
                "left_shoulder": 80.0,
                "right_shoulder": 80.0,
                "left_wrist": 168.0,
                "right_wrist": 168.0,
                "left_elbow": 140.0,
                "right_elbow": 140.0,
                "left_hip": 135.0,
                "right_hip": 135.0
            },
            "tolerances": {
                "left_knee": 14.0,
                "right_knee": 14.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 14.0,
                "right_elbow": 14.0
            },
            "pedagogical_tips": ["Keep knees supple with gentle spring."]
        },
        "Cholkettu Stance": {
            "description": "Introductory rhythmic salutation posture with hands clasped in Anjali Mudra at heart.",
            "ideal_angles": {
                "left_knee": 140.0,
                "right_knee": 140.0,
                "left_shoulder": 60.0,
                "right_shoulder": 60.0,
                "left_wrist": 150.0,
                "right_wrist": 150.0,
                "left_elbow": 75.0,
                "right_elbow": 75.0,
                "left_hip": 130.0,
                "right_hip": 130.0
            },
            "tolerances": {
                "left_knee": 12.0,
                "right_knee": 12.0,
                "left_shoulder": 12.0,
                "right_shoulder": 12.0,
                "left_wrist": 15.0,
                "right_wrist": 15.0,
                "left_elbow": 12.0,
                "right_elbow": 12.0
            },
            "pedagogical_tips": ["Keep eyes cast gently downward in Lasya devotional expression."]
        }
    }
}

def normalize_dance_form(dance_form: str = "Bharatanatyam") -> str:
    """Normalizes dance form name to standard Title Case matching REFERENCE_POSES."""
    if not dance_form or str(dance_form).strip().lower() in ("auto", "none", "", "null", "all"):
        return "Bharatanatyam"
    
    clean = str(dance_form).strip().lower()
    
    # 1. Exact canonical dictionary lookup (highest priority)
    canonical_map = {
        "bharatanatyam": "Bharatanatyam",
        "kathak": "Kathak",
        "kathakali": "Kathakali",
        "kuchipudi": "Kuchipudi",
        "mohiniyattam": "Mohiniyattam"
    }
    if clean in canonical_map:
        return canonical_map[clean]
        
    # 2. Check if clean starts with canonical name
    for key, name in sorted(canonical_map.items(), key=lambda x: len(x[0]), reverse=True):
        if clean.startswith(key):
            return name
            
    # 3. Substring of valid form in descriptive text (e.g. "Normal Stance (Kathak Tendency)")
    # Checked in descending order of length so "Kathakali" is matched before "Kathak"
    for key, name in sorted(canonical_map.items(), key=lambda x: len(x[0]), reverse=True):
        if re.search(r'\b' + re.escape(key) + r'\b', clean) or key in clean:
            return name
            
    return "Bharatanatyam"

def find_reference_pose(dance_form: str = "Bharatanatyam", target_pose: str = "Aramandi (Ayata)") -> dict:
    """
    Fuzzy matches a target pose name within the specified dance form.
    Handles aliases, partial matches, and falls back gracefully.
    """
    form_key = normalize_dance_form(dance_form)
    form_poses = REFERENCE_POSES.get(form_key, REFERENCE_POSES["Bharatanatyam"])
    
    if not target_pose:
        first_k = list(form_poses.keys())[0]
        return {"name": first_k, "dance_form": form_key, **form_poses[first_k]}
    
    clean_target = re.sub(r'[^a-zA-Z0-9]', '', str(target_pose)).lower()
    
    # 1. Exact match
    if target_pose in form_poses:
        return {"name": target_pose, "dance_form": form_key, **form_poses[target_pose]}
        
    # 2. Normalized alphanumeric match
    for k, v in form_poses.items():
        clean_k = re.sub(r'[^a-zA-Z0-9]', '', k).lower()
        if clean_k == clean_target or clean_target in clean_k or clean_k in clean_target:
            return {"name": k, "dance_form": form_key, **v}
            
    # 3. Check cross-tradition match
    for f_name, poses in REFERENCE_POSES.items():
        for k, v in poses.items():
            clean_k = re.sub(r'[^a-zA-Z0-9]', '', k).lower()
            if clean_k == clean_target or clean_target in clean_k or clean_k in clean_target:
                return {"name": k, "dance_form": f_name, **v}
                
    # 4. Fallback to first pose of tradition
    first_k = list(form_poses.keys())[0]
    return {"name": first_k, "dance_form": form_key, **form_poses[first_k]}

def get_default_reference_pose(dance_form: str = "Bharatanatyam"):
    """Returns the primary benchmark pose for a given dance form."""
    return find_reference_pose(dance_form, "")
