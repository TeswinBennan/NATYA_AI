import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set publication style
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 9.5

os.makedirs('figures', exist_ok=True)

fig, ax = plt.subplots(figsize=(14.5, 11.0), dpi=300)
ax.set_xlim(0, 14.5)
ax.set_ylim(0, 11.0)
ax.axis('off')

# Background
fig.patch.set_facecolor('#ffffff')

def draw_card(ax, x, y, w, h, title, subtitle_lines, header_bg, body_bg, border_color):
    # Drop Shadow
    shadow = patches.FancyBboxPatch((x + 0.05, y - 0.05), w, h, boxstyle='round,pad=0.06,rounding_size=0.18',
                                   facecolor='#cbd5e1', edgecolor='none', alpha=0.35, zorder=1)
    ax.add_patch(shadow)
    
    # Main card container
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.06,rounding_size=0.18',
                                 facecolor=body_bg, edgecolor=border_color, linewidth=1.6, zorder=2)
    ax.add_patch(box)
    
    # Header banner (top portion)
    head_h = 0.44
    head = patches.FancyBboxPatch((x, y + h - head_h), w, head_h, boxstyle='round,pad=0.06,rounding_size=0.18',
                                  facecolor=header_bg, edgecolor=border_color, linewidth=1.4, zorder=3)
    ax.add_patch(head)
    
    # Square bottom corners of header
    sq = patches.Rectangle((x - 0.04, y + h - head_h - 0.04), w + 0.08, head_h * 0.4,
                           facecolor=header_bg, edgecolor='none', zorder=3)
    ax.add_patch(sq)
    
    # Header title text
    ax.text(x + w / 2, y + h - head_h / 2, title,
            ha='center', va='center', fontsize=10.5, fontweight='bold', color='#ffffff', zorder=4)
    
    # Card Body Content
    n_lines = len(subtitle_lines)
    # Available height in body: h - head_h
    body_avail_h = h - head_h - 0.15
    spacing = body_avail_h / (n_lines + 0.5)
    start_y = y + h - head_h - 0.18
    
    for idx, line in enumerate(subtitle_lines):
        line_y = start_y - (idx * spacing)
        ax.text(x + w / 2, line_y, line,
                ha='center', va='center', fontsize=8.8, color='#1e293b', zorder=4)

def draw_arrow(ax, x1, y1, x2, y2, label=''):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(facecolor='#334155', edgecolor='#1e293b', width=1.8,
                                headwidth=7.5, headlength=7.5, shrink=0.01),
                zorder=5)
    if label:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2, label,
                ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a',
                bbox=dict(boxstyle='round,pad=0.22', facecolor='#ffffff', edgecolor='#94a3b8', lw=1.0),
                zorder=6)

# Main Title & Subtitle
ax.text(7.25, 10.50, 'Proposed Natya AI System Architecture',
        ha='center', va='center', fontsize=16, fontweight='bold', color='#0f172a')
ax.text(7.25, 10.15, 'Multimodal Deep Vision, Skeletal Biomechanics & Digital Twin Pedagogical Framework',
        ha='center', va='center', fontsize=11, fontstyle='italic', color='#475569')

# Top Node: Input Acquisition
draw_card(ax, x=4.45, y=8.50, w=5.6, h=1.20,
          title='1. INPUT STREAM ACQUISITION',
          subtitle_lines=[
              'Live RGB Webcam Feed (Learner) & Reference Master Stream (Guru)',
              'Synchronous Multi-Threaded Ingestion | 30-60 FPS Dynamic Normalization',
              'Dual Stream Extraction: Full-Body Pose & Bilateral Hand Articulations'
          ],
          header_bg='#2563eb', body_bg='#eff6ff', border_color='#1d4ed8')

# Branch Left: Skeletal Body Pose Pipeline
draw_card(ax, x=0.6, y=6.45, w=5.8, h=1.45,
          title='2A. BODY POSE TELEMETRY (MEDIAPIPE)',
          subtitle_lines=[
              '33 3D Anatomical Landmarks Extraction with Depth Telemetry',
              'Open-Set Anatomical Gatekeeper: Casual Movement / Non-Human Rejection',
              'Real-Time Bounding Box Normalization & Spatial Anchor Tracking'
          ],
          header_bg='#0284c7', body_bg='#f0f9ff', border_color='#0369a1')

draw_card(ax, x=0.6, y=4.40, w=5.8, h=1.45,
          title='3A. TEMPORAL EXPONENTIAL SMOOTHING',
          subtitle_lines=[
              r'Recursive EMA Low-Pass Filter: $\hat{x}_t = \alpha \cdot x_t + (1-\alpha) \cdot \hat{x}_{t-1}$',
              r'Keypoint Jitter Attenuation: $\alpha_{pose} = 0.35$ (Suppresses Sensor Drift)',
              r'Core Balance Smoothing: $\alpha_{balance} = 0.30$ (Stabilizes Center-of-Mass)'
          ],
          header_bg='#0369a1', body_bg='#f0f9ff', border_color='#075985')

draw_card(ax, x=0.6, y=2.35, w=5.8, h=1.45,
          title='4A. BIOMECHANICAL STANCE KINEMATICS',
          subtitle_lines=[
              r'10 Articulation Angles: Bilateral Shoulders ($\theta_S$), Elbows ($\theta_E$), Knees ($\theta_K$)',
              r'Center-of-Mass Offset: $\delta_{cog} = |x_{hip\_mid} - x_{ankle\_mid}| \to$ Stability Score ($S_{bal}$)',
              'Aramandi Stance Verification: Deep (<=135 deg), Half (135-155 deg), Straight (>165 deg)'
          ],
          header_bg='#0d9488', body_bg='#f0fdfa', border_color='#0f766e')

# Branch Right: Hand Landmark & Mudra Pipeline
draw_card(ax, x=8.1, y=6.45, w=5.8, h=1.45,
          title='2B. HAND LANDMARKING (MEDIAPIPE)',
          subtitle_lines=[
              '21 High-Resolution 3D Landmarks per Hand with Sub-Pixel Precision',
              'Bilateral Recognition: Asamyuta (Single-Hand) & Samyuta (Two-Hand)',
              'Independent Coordinate Normalization & Knuckle Topology Graph'
          ],
          header_bg='#d97706', body_bg='#fffbeb', border_color='#b45309')

draw_card(ax, x=8.1, y=4.40, w=5.8, h=1.45,
          title='3B. PALM-SCALE NORMALIZATION ENGINE',
          subtitle_lines=[
              r'Palm Scale Reference Metric: $s_{palm} = ||p_9 - p_0||_2$ (Wrist to Middle MCP)',
              'Distance-Invariant Finger Coordinate Scaling & Aspect Ratio Preservation',
              r'Thumb Abduction Angle Formulation: $\theta_{abduct} = \angle(p_5, p_0, p_4)$'
          ],
          header_bg='#ca8a04', body_bg='#fefce8', border_color='#a16207')

draw_card(ax, x=8.1, y=2.35, w=5.8, h=1.45,
          title='4B. MUDRA RECOGNITION & CLASSIFICATION',
          subtitle_lines=[
              'Extension Ratios Rf Discretized: {Folded (0.0), Curved (0.5), Extended (1.0)}',
              'Topological Fingertip Constraints Engine (Hamsasya, Mayura, Mukula, etc.)',
              'Multi-Criteria Classification Formulation P(M) Across 28 Canonical Hastas'
          ],
          header_bg='#e11d48', body_bg='#fff1f2', border_color='#be123c')

# Bottom Center: Fusion & Digital Twin Real-Time HUD
draw_card(ax, x=2.25, y=0.30, w=10.0, h=1.45,
          title='5. TEMPORAL DIGITAL TWIN & REAL-TIME PEDAGOGICAL HUD',
          subtitle_lines=[
              'Dynamic Time Warping (DTW) Sequence Alignment | Laya Cadence Tempo Extraction (BPM via Wrist Velocity)',
              r'Color-Coded Skeletal HUD: Green ($\Delta\theta \leq 14^\circ$), Yellow ($14^\circ < \Delta\theta \leq 26^\circ$), Red ($\Delta\theta > 26^\circ$)',
              'Composite Assessment: S_overall = 0.40 S_match + 0.25 S_tempo + 0.20 S_bal + 0.15 C_class with Real-Time Directives'
          ],
          header_bg='#4f46e5', body_bg='#eef2ff', border_color='#4338ca')

# Connectors: Input to branches
draw_arrow(ax, 5.5, 8.50, 3.5, 7.95, 'Body Stream')
draw_arrow(ax, 9.0, 8.50, 11.0, 7.95, 'Hand Stream')

# Left Branch Vertical Connectors
draw_arrow(ax, 3.5, 6.45, 3.5, 5.90)
draw_arrow(ax, 3.5, 4.40, 3.5, 3.85)
draw_arrow(ax, 3.5, 2.35, 5.0, 1.80)

# Right Branch Vertical Connectors
draw_arrow(ax, 11.0, 6.45, 11.0, 5.90)
draw_arrow(ax, 11.0, 4.40, 11.0, 3.85)
draw_arrow(ax, 11.0, 2.35, 9.5, 1.80)

plt.savefig('figures/fig1_architecture.png', dpi=300, bbox_inches='tight')
plt.close()
print('Figure 1 regenerated with perfect spacing!')
