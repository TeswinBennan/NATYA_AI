# Performance Analysis, Experimental Results, and Conclusion

---

## 4. PERFORMANCE METRICS

### 4.1 Confusion Matrix
The confusion matrix is a fundamental evaluation tool that quantifies the classification efficacy of the proposed model in discriminating between canonical classical dance gestures and postural deviations. The matrix categorizes predictions into four distinct outcomes:
* **True Positive ($TP$):** A canonical classical posture or *mudra* correctly classified as canonical.
* **False Negative ($FN$):** A canonical classical posture erroneously classified as deviant or non-classical.
* **False Positive ($FP$):** A casual, incorrect, or non-classical posture wrongly classified as canonical.
* **True Negative ($TN$):** A casual or deviant posture correctly identified and rejected as non-classical.

### 4.2 Accuracy
Accuracy ($ACC$) represents the proportion of correctly classified canonical and non-classical posture instances over the total number of evaluated dance frames:

$$\text{Accuracy (ACC)} = \frac{TP + TN}{TP + TN + FP + FN}$$

### 4.3 Precision, Recall, and F1-Score
To evaluate model performance under class imbalance and subtle gesture variations, Precision, Recall, and the harmonic F1-score are defined as:

$$\text{Precision} = \frac{TP}{TP + FP}$$

$$\text{Recall} = \frac{TP}{TP + FN}$$

$$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

### 4.4 Detection Latency & Computational Time
Computational efficiency is evaluated via the end-to-end execution time required to process video frames (recorded as detection time in seconds per 100 frames and instantaneous throughput in Frames Per Second [FPS]). Real-time pedagogical feedback requires a processing latency below 50 ms per frame ($> 30\text{ FPS}$).

---

## 5. RESULT AND ANALYSIS

The experimental evaluation of **Natya AI** was conducted on an experimental corpus comprising **2,000 instances** collected across 15 dancers (8 intermediate students, 5 advanced practitioners, and 2 senior gurus) representing five classical traditions (*Bharatanatyam, Kathak, Kathakali, Kuchipudi, and Mohiniyattam*). 

The dataset was partitioned into **1,400 instances for model training and benchmark calibration** and **600 instances for blind testing and validation**. 

### Table 1: Feature Extraction and Biomechanical Parameter Selection

| Feature Index | Biomechanical Feature Parameter | Mathematical Formulation | Description & Operational Significance |
| :---: | :--- | :---: | :--- |
| **$f_1$** | Palm Scale Reference Metric ($s_{\text{palm}}$) | $\|\mathbf{p}_9 - \mathbf{p}_0\|_2$ | Normalizes hand size based on distance from wrist ($\mathbf{p}_0$) to middle MCP knuckle ($\mathbf{p}_9$). |
| **$f_2$** | Finger Extension Ratios ($R_f$) | $\frac{\|\mathbf{p}_{\text{tip}, f} - \mathbf{p}_0\|}{\|\mathbf{p}_{\text{mcp}, f} - \mathbf{p}_0\|}$ | Evaluates flexion state ($0.0 = \text{folded}, 0.5 = \text{curved}, 1.0 = \text{extended}$). |
| **$f_3$** | Thumb Abduction Angle ($\theta_{\text{abduct}}$) | $\angle(\mathbf{p}_5, \mathbf{p}_0, \mathbf{p}_4)$ | Distinguishes wide crescent gestures (*Ardhachandra* $>60^\circ$) from tucked gestures (*Pataka*). |
| **$f_4$** | Inter-Finger Spatial Separation | $D_{i,j} = \frac{\|\mathbf{p}_i - \mathbf{p}_j\|}{s_{\text{palm}}}$ | Identifies scissors separation in *Kartarimukha* and apex convergence in *Mukula*. |
| **$f_5$** | Bilateral Shoulder Angular Vector ($\theta_{LS}, \theta_{RS}$) | $\angle(\text{Hip}, \text{Shoulder}, \text{Elbow})$ | Measures horizontal arm elevation corresponding to canonical *Natyarambha* ($85^\circ \pm 10^\circ$). |
| **$f_6$** | Bilateral Knee Turnout Angle ($\theta_{LK}, \theta_{RK}$) | $\angle(\text{Hip}, \text{Knee}, \text{Ankle})$ | Differentiates deep *Aramandi* ($\le 135^\circ$), half stance ($135^\circ\text{--}155^\circ$), and straight legs ($>165^\circ$). |
| **$f_7$** | Center-of-Mass (CoM) Balance Offset ($\delta_{\text{cog}}$) | $\|x_{\text{hip\_mid}} - x_{\text{ankle\_mid}}\|$ | Quantifies lateral gravity line deviation to calculate core stability score ($0\text{--}100$). |
| **$f_8$** | Temporal EMA Smoothing Parameter ($\alpha$) | $\hat{\mathbf{x}}_t = \alpha \mathbf{x}_t + (1-\alpha)\hat{\mathbf{x}}_{t-1}$ | Filters high-frequency optical noise ($\alpha_{\text{pose}}=0.35, \alpha_{\text{mudra}}=0.45, \alpha_{\text{bal}}=0.30$). |

---

### Classification Performance on Training and Testing Sets

![Fig. 2 Accuracy rate with confusion matrix for target class of testing and training](figures/fig2_confusion_matrices.png)

> **Fig. 2.** Accuracy rate with confusion matrix for target class of testing and training data.

An accuracy of **89.6%** was achieved with the proposed **Natya AI** framework on the training dataset (1,400 instances). On the unseen testing dataset (600 instances), the proposed model achieved an accuracy of **88.5%** (266 canonical and 265 deviant postures correctly classified, with 34 false negatives and 35 false positives reflecting real-world lighting, loose garments, and perspective variations). The balanced diagonal concentration in both matrices confirms the robust discriminatory capability of the joint angle and topological descriptors without exhibiting synthetic overfitting.

---

### Comparative Evaluation across Detection Models

To validate the multi-branch architecture, the proposed framework was benchmarked against classical baseline models: a Support Vector Machine (SVM) classifier and a Standard Convolutional Neural Network (CNN).

![Fig. 2.1 Recall and accuracy value of proposed Natya AI detection model](figures/fig2_1_recall_accuracy.png)

> **Fig. 2.1.** Recall and accuracy values of proposed Natya AI model compared with SVM and Standard CNN baselines.

As illustrated in **Fig. 2.1**, the proposed Natya AI framework achieves a **Recall of 88.7%** and an **Accuracy of 88.5%**, outperforming the baseline SVM (77.2% Recall, 76.4% Accuracy) and the Standard CNN (82.8% Recall, 82.1% Accuracy). 

![Fig. 2.2 F-score and detection time value of proposed model](figures/fig2_2_fscore_detection_time.png)

> **Fig. 2.2.** F1-score and detection time comparison of proposed model against comparative algorithms.

**Fig. 2.2** displays the comparative F1-scores and detection times. The proposed framework attained an **F1-score of 88.5%** while reducing inference detection time to **2.37 seconds per 100 frames** (equivalent to ~42.2 FPS), significantly faster than the Standard CNN (4.50 s) and the SVM baseline (6.80 s).

---

### Table 2: Performance Comparison of Proposed Work with SVM and Standard CNN

| Method | Accuracy (%) | F1-Score (%) | Recall (%) | Detection Time (s / 100 frames) | Throughput (FPS) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SVM Baseline** | 76.4 | 76.8 | 77.2 | 6.80 | 14.7 |
| **Standard CNN** | 82.1 | 82.4 | 82.8 | 4.50 | 22.2 |
| **Proposed Natya AI** | **88.5** | **88.5** | **88.7** | **2.37** | **42.2** |

The performance comparison in **Table 2** demonstrates that the proposed architecture achieves superior classification accuracy, recall, and computational efficiency under unconstrained rehearsal conditions. The combination of temporal EMA smoothing and palm-scale metric normalization enables Natya AI to suppress optical jitter while sustaining real-time throughput (>30 FPS) on standard edge devices.

---

### Validation Against Senior Guru Ratings

![Fig. 2.3 Senior Guru Correlation Analysis](figures/fig2_3_guru_correlation.png)

> **Fig. 2.3.** Kinematic score correlation between Natya AI composite score ($S_{\text{overall}}$) and senior guru evaluation ratings.

To evaluate real-world pedagogical fidelity, the automated scores generated by Natya AI were compared with independent evaluation scores provided by senior dance gurus across 45 rehearsal sessions. As illustrated in **Fig. 2.3**, the automated kinematic scoring demonstrated a strong linear correlation with guru assessments (Pearson correlation coefficient **$r = 0.86, p < 0.001$**), confirming that the computational model accurately captures the aesthetic and biomechanical standards of codified Indian classical dance.

---

## 6. CONCLUSION

This paper presented **Natya AI**, a real-time multimodal computer-vision platform and digital twin architecture designed for automated performance assessment in Indian classical dance. By systematically encoding the geometric principles of foundational treatises (*Natya Shastra* and *Abhinaya Darpana*) into computer-vision pipelines, the system successfully addresses the challenges of unsupervised home rehearsal and cultural heritage preservation.

The integration of 33-point skeletal pose estimation with 21-point hand landmark tracking, stabilized by temporal Exponential Moving Average (EMA) filters, achieved a testing accuracy of **88.5%**, an F1-score of **88.5%**, and a low detection latency of **2.37 seconds per 100 frames** (~42.2 FPS). Furthermore, the automated posture scoring demonstrated strong alignment with senior guru evaluations ($r = 0.86$). The proposed system provides dancers with immediate, objective, closed-loop feedback, establishing an effective and accessible paradigm for technological heritage preservation and classical dance pedagogy.

---

## References

1. K. N. Gautam, “Relevance of Bharata Muni’s Natyashastra in Digital Era,” *Bodhi: An Interdisciplinary Journal*, vol. 10, no. 2, pp. 61–78, Sept. 2024.
2. N. Bhaskar, T.-W. Priyanka, V. K. S, and A. K. P, “A Multi-Modal Deep Learning Framework for Bharatanatyam Mudra Recognition Sequence Interpretation and Performance Evaluation,” in *Proc. IEEE ICICNIS*, Dec. 2025, pp. 1611–1616.
3. N. Parthasarathy and Y. Palanichamy, “Novel Video Benchmark Dataset Generation and Real-Time Recognition of Symbolic Hand Gestures in Indian Dance Applying Deep Learning Techniques,” *ACM Journal on Computing and Cultural Heritage*, Mar. 2023.
4. K. Madhura and H. M. Manjula, “A Hybrid Model Proposal to Recognize the Hand Gestures of Bharatanatyam mudras,” in *Proc. IEEE ICCAMS*, Oct. 2023, pp. 1–7.
5. J. Jayanthi and P. U. Maheswari, “Reviving Cultural Heritage: Advancements in Pose Recognition and 3D Model Reconstruction for Indian Classical Dance Using AI and Augmented Reality Technologies,” June 2024.
6. X. Yang, “Intelligent Evaluation and Correction of Dance Pose Using Hybrid Siamese Networks,” in *Proc. IEEE IACIS*, Aug. 2025, pp. 1–6.
7. D. Cao, Q. Sun, and T. Cui, “Research on an Improved RTMPose Model for Evaluating Dance Standardization Scores,” in *Proc. IEEE ICIST*, Dec. 2024, pp. 640–647.
8. S. Deb, A. Sharan, S. Chaturvedi, A. Arun, and A. Gupta, “Interactive Dance Lessons through Human Body Pose Estimation and Skeletal Topographies Matching,” *SSRN Electronic Journal*, Jan. 2018.
