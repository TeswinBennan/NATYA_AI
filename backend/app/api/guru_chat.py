import re
from typing import List, Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.api.mudra import ALL_ASAMYUTA_HASTAS, ALL_SAMYUTA_HASTAS
from app.ai.reference_poses import REFERENCE_POSES

router = APIRouter(prefix="/guru-chat", tags=["AI Natya Guru Chatbot"])

class ChatMessage(BaseModel):
    role: str # 'user' | 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    language: Optional[str] = "english"

# =========================================================================
# 1. EXPANDED ENCYCLOPEDIC KNOWLEDGE REPOSITORY
# =========================================================================
ENCYCLOPEDIA_ENTRIES = [
    # ---------------------------------------------------------------------
    # GREETINGS & INTRODUCTIONS
    # ---------------------------------------------------------------------
    {
        "keywords": ["hi", "hello", "hey", "namaskaram", "namaste", "greetings", "pranam", "vanakkam", "who are you", "what can you do"],
        "answer": (
            "**Namaskaram!** I am your **AI Natya Guru**, steeped in the sacred traditions of Bharata Muni's *Natyashastra* and Nandikesvara's *Abhinaya Darpana*.\n\n"
            "I can guide your classical dance practice in multiple dimensions:\n"
            "• **Kinematic Stance & Geometry**: Ask about Aramandi, Natyarambha, Samapada, Tribhanga, or Chauka.\n"
            "• **52 Hastha Mudras**: Meanings, Sanskrit shlokas, finger formations, and usages for all Asamyuta and Samyuta Hastas.\n"
            "• **Tala & Laya**: Adi, Rupaka, Misra Chapu, Teental cycles, Sollukattu syllables, and Kalam speeds.\n"
            "• **Traditions & History**: In-depth knowledge of Bharatanatyam, Kathak, Kathakali, Kuchipudi, Mohiniyattam, and Odissi.\n"
            "• **Margam Repertoire**: From Alarippu, Jatiswaram, and Varnam to Thillana, Padams, and Tarangam.\n"
            "• **AI Studios**: Guidance on Kinematic Studio, Mudra Classifier, Digital Twin, and your personal Analysis Vault.\n\n"
            "*How may I guide your practice today?*"
        )
    },

    # ---------------------------------------------------------------------
    # FUNDAMENTAL POSTURES & GEOMETRY
    # ---------------------------------------------------------------------
    {
        "keywords": ["aramandi", "araimandi", "ayatam", "half sit", "diamond stance", "squat", "knee angle", "bend knees"],
        "answer": (
            "### **Aramandi (Ayatam) — The Diamond Foundation**\n\n"
            "Aramandi is the foundational half-seated posture in Bharatanatyam, Kuchipudi, and Mohiniyattam:\n\n"
            "1. **Knee Turnout**: Knees bend outward laterally to form a wide diamond silhouette, with an ideal inner joint angle of **120° to 135°**.\n"
            "2. **Feet Alignment**: Heels are kept joined together with toes flared outward forming a straight 180° horizontal line.\n"
            "3. **Spinal Poise (*Sama Kaya*)**: The spine must be held perfectly vertical without leaning forward or tilting the pelvis backward.\n"
            "4. **Torso & Pelvis**: Tuck the tailbone gently underneath to support the lower back and prevent anterior pelvic tilt.\n\n"
            "💡 *Practice Tip*: You can test your live Aramandi knee angle and balance score in our **Kinematic Studio** (`/analyze`)!"
        )
    },
    {
        "keywords": ["natyarambha", "arms", "elbow angle", "shoulder line", "arm position", "upper body"],
        "answer": (
            "### **Natyarambha — The Expansive Symmetrical Frame**\n\n"
            "Natyarambha (*beginning of dance*) defines the upper body geometry:\n\n"
            "1. **Elbow Elevation**: Elbows are raised to the exact horizontal level of the shoulders, maintaining an expansive arc angle of **160° to 170°**.\n"
            "2. **Wrist Tension**: Wrists remain straight and energized without drooping or hyperextending.\n"
            "3. **Chest Expansion**: The chest is lifted proudly (*Uras*) without arching the lumbar spine.\n"
            "4. **Hand Position**: Typically held in Pataka or Tripataka mudra at shoulder height, creating an unbroken line of energy from fingertip to fingertip.\n\n"
            "💡 *Common Mistake*: Dropping the elbows below shoulder level causes posture fatigue. Keep shoulder blades engaged (*scapular retraction*)."
        )
    },
    {
        "keywords": ["samapada", "standing", "neutral posture", "basic stance", "upright"],
        "answer": (
            "### **Samapada — The Grounded Neutral Stance**\n\n"
            "Samapada is the serene, upright standing posture where both feet are placed flat and parallel, bearing equal body weight:\n\n"
            "• **Body Axis**: Plumb line passes vertically through the crown of the head, throat, navel, and center between the heels.\n"
            "• **Usage**: Used during invocations (*Pushpanjali*), devotional stotras, and transitions between energetic Adavus.\n"
            "• **Spiritual Significance**: Embodies stability, equanimity (*Shanta Rasa*), and rooted connection to Mother Earth."
        )
    },
    {
        "keywords": ["tribhanga", "odissi", "three bends", "chauka", "bhangi"],
        "answer": (
            "### **Tribhanga & Chauka — The Sculptural Essence of Odissi**\n\n"
            "Odissi is renowned for two fundamental stances inspired by ancient temple sculptures:\n\n"
            "1. **Chauka (Square Stance)**:\n"
            "   • Masculine, grounded stance representing Lord Jagannath.\n"
            "   • Feet spread wide, knees bent outward at 90°-110°, hands held in Pataka at chest level.\n\n"
            "2. **Tribhanga (Three Bends)**:\n"
            "   • Feminine, lyrical posture with three distinct body deflections:\n"
            "     - Deflection 1: Head tilts gently to one side.\n"
            "     - Deflection 2: Torso shifts to the opposite side.\n"
            "     - Deflection 3: Hips shift in the direction of the head tilt.\n"
            "   • Creates the iconic S-curve seen on Konark and Khajuraho temple facades."
        )
    },
    {
        "keywords": ["tatkar", "chakkars", "kathak spins", "pirouettes", "footwork kathak", "spin"],
        "answer": (
            "### **Kathak Tatkar & Chakkars**\n\n"
            "1. **Tatkar (Rhythmic Footwork)**:\n"
            "   • Foundational flat-foot stamping executed with micro-precise rhythmic syllables: *Ta - Thei - Thei - Tat | Aa - Thei - Thei - Tat*.\n"
            "   • Performed with knees straight, torso upright, and ghungroo ankle bells resonant with the Teental 16-beat cycle.\n\n"
            "2. **Chakkars (Lightning Pirouettes)**:\n"
            "   • Executed by pivoting sharply on the left heel and ball of the right foot.\n"
            "   • The dancer fixes their gaze (*spotting*) to maintain balance through 9, 18, or 27 consecutive spins, halting crisply on *Sum* (Beat 1)."
        )
    },

    # ---------------------------------------------------------------------
    # ADAVU FAMILIES & PRACTICE DRILLS
    # ---------------------------------------------------------------------
    {
        "keywords": ["adavu", "adavus", "tatta adavu", "natta adavu", "kuditta metti", "basic steps", "practice routine", "exercises"],
        "answer": (
            "### **Foundational Adavu Syllabus (Bharatanatyam & Kuchipudi)**\n\n"
            "Adavus are the modular building blocks of classical Nritta (pure dance):\n\n"
            "1. **Tatta Adavu (8 variations)**: Flat-foot stamping in Aramandi. *Sollukattu: Tha Dhi Thom Nam*.\n"
            "2. **Natta Adavu (8 variations)**: Heel-and-toe extensions with sweeping arm movements. *Sollukattu: Thai Yum That Tha*.\n"
            "3. **Kuditta Metti Adavu**: Jumping on toes and stamping flat on heels. *Sollukattu: Thai Hath Thai Hi*.\n"
            "4. **Sarikkal Adavu**: Sliding footwork sideways and diagonally with fluid torso shifts.\n"
            "5. **Mandi Adavu**: Deep knee drops and floor touching transitions.\n"
            "6. **Paichal / Utplavana**: Graceful leaping and airborne crossings.\n\n"
            "⏱️ **Daily Practice Drill**: Perform each Adavu variation across **3 speeds (Kalam)**:\n"
            "• *1st Speed (Vilambita)*: 60 BPM — Focus on maximum Aramandi depth and clean lines.\n"
            "• *2nd Speed (Madhyama)*: 120 BPM — Focus on stamina and sharp wrist accents.\n"
            "• *3rd Speed (Druta)*: 240 BPM — Focus on lightning rhythm and effortless facial poise."
        )
    },

    # ---------------------------------------------------------------------
    # TALA, RHYTHM & SOLLUKATTU
    # ---------------------------------------------------------------------
    {
        "keywords": ["tala", "taal", "rhythm", "adi tala", "rupaka", "misra chapu", "khanda chapu", "teental", "matra", "avartana", "sollukattu", "nattuvangam"],
        "answer": (
            "### **Classical Tala Cycles & Nattuvangam Rhythms**\n\n"
            "Tala regulates the cyclic structure of time (*Kala*) in Indian music and dance:\n\n"
            "• **Adi Tala (Carnatic — 8 Beats)**:\n"
            "  - Structure: 1 Laghu (4 counts: Clap + 3 finger counts) + 2 Dhrutams (Clap + Wave, Clap + Wave).\n  - Total: 8 Matras. The supreme king of dance rhythms.\n\n"
            "• **Rupaka Tala (Carnatic — 6 Beats)**:\n"
            "  - Structure: 1 Dhrutam (2 counts) + 1 Laghu (4 counts) = 6 Matras. Energetic and bouncing.\n\n"
            "• **Misra Chapu (Carnatic — 7 Beats)**:\n"
            "  - Uneven syncopated cycle split as: **3 + 2 + 2** (*Tha-Ki-Ta | Tha-Ka | Dhi-Mi*).\n\n"
            "• **Teental (Hindustani / Kathak — 16 Matras)**:\n"
            "  - 4 Vibhags of 4 beats each: *Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha* (Clap on 1, 5, 13; Wave on 9).\n\n"
            "💡 *Studio Tool*: Open our **Tala Metronome** (`/tala-metronome`) to practice with real acoustic cymbals and tempo sliders!"
        )
    },

    # ---------------------------------------------------------------------
    # NAVARASA & THE 4 ABHINAYAS
    # ---------------------------------------------------------------------
    {
        "keywords": ["rasa", "navarasa", "9 emotions", "bhava", "abhinaya", "facial expression", "shringara", "hasya", "karuna", "raudra", "veera", "bhayanaka", "bibhatsa", "adbhuta", "shanta"],
        "answer": (
            "### **The 9 Navarasas (Aesthetic Flavors of Natyashastra)**\n\n"
            "Codified in Chapter 6 of the *Natyashastra*, the Navarasas represent the universal spectrum of human emotion:\n\n"
            "1. **Shringara (Love & Divine Devotion)**: Eyebrows arched gently, soft radiant gaze.\n"
            "2. **Hasya (Joy & Mirth)**: Cheeks lifted, smiling eyes, twinkling expression.\n"
            "3. **Karuna (Compassion & Pathos)**: Drooping eyelids, heavy gaze, slight quiver of lips.\n"
            "4. **Raudra (Righteous Fury & Wrath)**: Flaring nostrils, wide piercing eyes, knitted brows.\n"
            "5. **Veera (Heroism & Courage)**: Firm jawline, commanding upright chin, confident gaze.\n"
            "6. **Bhayanaka (Fear & Terror)**: Shifting darting eyes, breathless hesitation, shrinking posture.\n"
            "7. **Bibhatsa (Disgust & Aversion)**: Wrinkled nose, narrowed eyes, curled lip turning away.\n"
            "8. **Adbhuta (Wonder & Marvel)**: Wide-eyed amazement, parted lips, lifted forehead.\n"
            "9. **Shanta (Peace & Transcendence)**: Serene half-closed eyes, stillness, divine equanimity.\n\n"
            "**The 4 Types of Abhinaya (Expressive Vehicles)**:\n"
            "• *Angika*: Body postures, mudras, head (*Shiro Bheda*), eyes (*Drishti Bheda*).\n"
            "• *Vachika*: Vocal recitation, sung poetry, and sollukattus.\n"
            "• *Aharya*: Sacred costume, ornaments, ghungroos, and alta dye.\n"
            "• *Sattvika*: Authentic internal emotional truth."
        )
    },

    # ---------------------------------------------------------------------
    # MARGAM REPERTOIRE (CLASSICAL DANCE PERFORMANCE SUITE)
    # ---------------------------------------------------------------------
    {
        "keywords": ["margam", "alarippu", "jatiswaram", "shabdam", "varnam", "padam", "javali", "thillana", "mangalam", "tarangam", "pushpanjali"],
        "answer": (
            "### **The Traditional Margam (Performance Suite)**\n\n"
            "Devised by the Tanjore Quartet, the Margam structured recital progresses like entering a magnificent temple:\n\n"
            "1. **Pushpanjali / Alarippu**: Floral offering and pure Nritta warm-up waking the body's joints from head to toe in 3 speeds.\n"
            "2. **Jatiswaram**: Pure abstract rhythm set to Carnatic Raga Swaras (no lyrics).\n"
            "3. **Shabdam**: First introduction of Abhinaya storytelling with lyrical verses praising the Divine.\n"
            "4. **Varnam (The Crown Masterpiece)**: Demanding 30-45 minute centerpiece blending intricate Theermanam footwork and deep Sanchari Bhava.\n"
            "5. **Padam & Javali**: Intimate emotive pieces exploring Nayika-Nayaka Bhavas and spiritual longing.\n"
            "6. **Thillana**: Fast-paced euphoric finale with rhythmic fireworks and statuesque temple poses.\n"
            "7. **Mangalam**: Final benedictory salutation to the Guru, deities, and universe."
        )
    },

    # ---------------------------------------------------------------------
    # DANCE TRADITIONS COMPARISON
    # ---------------------------------------------------------------------
    {
        "keywords": ["traditions", "classical dances", "compare", "difference", "styles", "bharatanatyam", "kathak", "kathakali", "kuchipudi", "mohiniyattam", "odissi"],
        "answer": (
            "### **The 6 Major Indian Classical Dance Traditions**\n\n"
            "• **Bharatanatyam (Tamil Nadu)**: Geometric precision, diamond Aramandi stance, crisp linear arms (*Natyarambha*), and intricate Theermanams.\n"
            "• **Kathak (North India)**: Upright spinal poise, lightning Chakkars (spins), complex Tatkar footwork, and subtle Ghungroo articulation.\n"
            "• **Kathakali (Kerala)**: Epic dance-drama with stylized face makeup (Paccha, Kathi), expansive Mudras, and dramatic heroic postures.\n"
            "• **Kuchipudi (Andhra Pradesh)**: Dynamic blend of pure Nritta, vocal dialogue, lyrical torso waves, and brass plate *Tarangam* balance.\n"
            "• **Mohiniyattam (Kerala)**: The enchanting dance of Lasya grace; gentle circular torso swaying, white-and-gold Kasavu silk attire.\n"
            "• **Odissi (Odisha)**: Temple sculpture aesthetics characterized by *Chauka* (square stance) and lyrical *Tribhanga* (3-bend curves)."
        )
    },

    # ---------------------------------------------------------------------
    # PLATFORM AI STUDIOS & ANALYSIS VAULT
    # ---------------------------------------------------------------------
    {
        "keywords": ["how to use", "kinematic studio", "style classifier", "digital twin", "3d twin", "vault", "history", "camera", "how natya ai works"],
        "answer": (
            "### **Natya AI Intelligence Studios Overview**\n\n"
            "1. **Kinematic Studio (`/analyze`)**:\n"
            "   • Upload any dance photo or video to extract 33 anatomical landmark angles, Aramandi depth, balance score, and rhythmic tempo (BPM).\n\n"
            "2. **Hastha Mudra Studio (`/mudra-studio`)**:\n"
            "   • MediaPipe 21-hand landmark geometry detecting 28 Asamyuta and 24 Samyuta Hastas with real-time finger alignment directives.\n\n"
            "3. **Style Classification (`/classify`)**:\n"
            "   • MobileNetV2 deep learning classifier recognizing Bharatanatyam, Kathak, Kathakali, Kuchipudi, and Mohiniyattam with >80% accuracy.\n\n"
            "4. **Digital Twin Studio (`/digital-twin`)**:\n"
            "   • Side-by-side comparative posture scoring against ideal Guru standards with angular deviation maps.\n\n"
            "5. **Analysis Vault (`/history`)**:\n"
            "   • Your private session archives, score history over time, joint angle telemetry logs, and annotated visual skeletons."
        )
    }
]


# =========================================================================
# 2. DYNAMIC HASTHA MUDRA LOOKUP ENGINE
# =========================================================================
def find_mudra_in_corpus(query: str) -> Optional[Dict[str, Any]]:
    """Searches 28 Asamyuta and 24 Samyuta Hastas for exact or fuzzy matches."""
    q = query.lower().strip()
    
    # Check all single & double hastas
    all_hastas = ALL_ASAMYUTA_HASTAS + ALL_SAMYUTA_HASTAS
    for m in all_hastas:
        m_id = m.get("id", "").lower()
        m_name = m.get("name", "").lower()
        
        # Word boundary or exact match
        if re.search(r'\b' + re.escape(m_id) + r'\b', q) or re.search(r'\b' + re.escape(m_name) + r'\b', q):
            return m
            
    return None


def format_mudra_response(mudra: Dict[str, Any]) -> str:
    """Formats rich pedagogical answer for any requested Hastha Mudra."""
    m_type = mudra.get("type", "Asamyuta")
    name = mudra.get("name", "Mudra")
    meaning = mudra.get("english_meaning", "")
    config = mudra.get("finger_configuration", "")
    symbolism = mudra.get("symbolism", "")
    usage = mudra.get("usage", "")

    return (
        f"### **{name} Hastha ({m_type} Mudra — *{meaning}*)**\n\n"
        f"**1. Finger Formation (*Anguli Vinyasa*)**:\n"
        f"{config}\n\n"
        f"**2. Sacred Symbolism & Meanings (*Viniyoga*)**:\n"
        f"• **Symbolizes**: {symbolism}\n"
        f"• **Classical Usages**: {usage}\n\n"
        f"**3. Classical Shloka Canon**:\n"
        f"*Codified in Nandikesvara's Abhinaya Darpana as a key {m_type.lower()} gesture for expressional abhinaya.*\n\n"
        f"💡 *Practice Tip*: You can test your hand alignment for **{name}** right now in our **Mudra Studio** (`/mudra-studio`) for real-time 21-point tracking!"
    )


# =========================================================================
# 3. MULTI-PASS INTENT & KEYWORD SCORING ENGINE
# =========================================================================
@router.post("/ask")
def chat_with_guru(req: ChatRequest):
    user_text = req.message.lower().strip()
    
    # ---------------------------------------------------------------------
    # PASS 1: Specific Hastha Mudra Lookup (e.g. "what is Kartarimukha")
    # ---------------------------------------------------------------------
    matched_mudra = find_mudra_in_corpus(user_text)
    if matched_mudra:
        return {
            "reply": format_mudra_response(matched_mudra),
            "guru_title": "AI Natya Guru (Natyashastra AI)",
            "source_canon": f"Abhinaya Darpana — {matched_mudra.get('type')} Hastha Lexicon"
        }

    # ---------------------------------------------------------------------
    # PASS 2: Multi-Keyword Scored Match in Expanded Encyclopedia
    # ---------------------------------------------------------------------
    best_entry = None
    max_score = 0

    for entry in ENCYCLOPEDIA_ENTRIES:
        score = 0
        for kw in entry["keywords"]:
            if kw in user_text:
                # Give higher weight to multi-word phrase matches
                score += len(kw.split()) * 2
        if score > max_score:
            max_score = score
            best_entry = entry

    if best_entry and max_score > 0:
        return {
            "reply": best_entry["answer"],
            "guru_title": "AI Natya Guru (Natyashastra AI)",
            "source_canon": "Natyashastra & Abhinaya Darpana"
        }

    # ---------------------------------------------------------------------
    # PASS 3: Dynamic Multi-Disciplinary Fallback with Actionable Wisdom
    # ---------------------------------------------------------------------
    fallback_reply = (
        "### **Guidance from the Natyashastra Tradition**\n\n"
        "In the classical Indian dance canon, every movement integrates three sacred dimensions:\n"
        "1. **Angika Abhinaya (Physical Geometry)**: Maintaining firm Aramandi diamond depth (120°-135°), erect spinal verticality (*Sama Kaya*), and expansive Natyarambha arm lines.\n"
        "2. **Vachika & Tala (Rhythmic Poise)**: Aligning your footwork precisely with cyclic Talas (Adi Tala, Teental) across Vilambita, Madhyama, and Druta speeds.\n"
        "3. **Sattvika Abhinaya (Emotional Authenticity)**: Channeling authentic inner Rasa through micro-expressions of the eyes (*Drishti Bheda*) and head (*Shiro Bheda*).\n\n"
        "Feel free to ask me about:\n"
        "• Any of the **52 Hastha Mudras** (e.g., *Pataka, Tripataka, Kartarimukha, Mayura, Shikhara, Anjali*)\n"
        "• Specific **Adavu footwork** (*Tatta, Natta, Kuditta Metti*)\n"
        "• **Tala rhythm structures** (*Adi Tala 8 beats, Misra Chapu 7 beats, Teental 16 beats*)\n"
        "• How to optimize your posture in our **Kinematic Studio** (`/analyze`) or **Digital Twin** (`/digital-twin`)!"
    )

    return {
        "reply": fallback_reply,
        "guru_title": "AI Natya Guru (Natyashastra AI)",
        "source_canon": "Natyashastra of Bharata Muni"
    }
