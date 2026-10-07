import os
import smtplib
import logging
import json
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM_EMAIL,
    SMTP_FROM_NAME,
    SMTP_ENABLED,
    NOTIFICATIONS_DIR
)

logger = logging.getLogger("natyaa_ai.email_service")
logging.basicConfig(level=logging.INFO)

def _save_fallback_notification(to_email: str, subject: str, html_body: str, notification_type: str):
    """
    Saves a local HTML & JSON record of the dispatched notification.
    Ensures an auditable history of sent emails even in development/offline modes.
    """
    try:
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        safe_email = to_email.replace("@", "_at_").replace(".", "_")
        filename = f"{timestamp}_{notification_type}_{safe_email}.html"
        filepath = os.path.join(NOTIFICATIONS_DIR, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_body)

        meta_filename = f"{timestamp}_{notification_type}_{safe_email}.json"
        meta_filepath = os.path.join(NOTIFICATIONS_DIR, meta_filename)
        with open(meta_filepath, "w", encoding="utf-8") as f:
            json.dump({
                "to": to_email,
                "subject": subject,
                "type": notification_type,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "html_file": filename
            }, f, indent=2)

        logger.info(f"📧 Notification recorded to fallback storage: {filepath}")
    except Exception as e:
        logger.error(f"Failed to record fallback notification: {e}")


def _dispatch_email(to_email: str, subject: str, html_content: str, plain_text: str, notification_type: str = "generic"):
    """
    Asynchronously or background-dispatches an email via SMTP.
    Falls back gracefully if SMTP is disabled, credentials are missing, or connection times out.
    """
    # Always save a local preview/audit copy
    _save_fallback_notification(to_email, subject, html_content, notification_type)

    if not SMTP_ENABLED:
        logger.info(f"SMTP is disabled in configuration. Skipping network delivery for {to_email}.")
        return {"status": "saved_locally", "delivered": False, "reason": "SMTP disabled"}

    if not SMTP_USER or not SMTP_PASSWORD:
        logger.info(f"No SMTP credentials configured in .env. Notification safely stored to disk for {to_email}.")
        return {"status": "saved_locally", "delivered": False, "reason": "No SMTP credentials"}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_USER}>"
        msg["To"] = to_email

        # Attach text & HTML parts
        msg.attach(MIMEText(plain_text, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        logger.info(f"Attempting SMTP delivery to {to_email} via {SMTP_HOST}:{SMTP_PORT}...")
        
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [to_email], msg.as_string())

        logger.info(f"✅ Notification email successfully delivered to {to_email}")
        return {"status": "sent", "delivered": True}

    except Exception as exc:
        logger.warning(f"⚠️ SMTP delivery to {to_email} failed ({exc}). Fallback notification remains available locally.")
        return {"status": "fallback_saved", "delivered": False, "error": str(exc)}


def send_welcome_email(
    email: str,
    full_name: str,
    dance_form_interest: str = "Bharatanatyam",
    experience_level: str = "Beginner / Student"
):
    """
    Dispatches a temple-gold branded Welcome & Onboarding email upon account creation.
    """
    subject = "🪔 Welcome to NATYA AI - Your Classical Dance Journey Begins!"
    name = full_name.strip() if full_name else "Classical Dancer"
    dance_form = dance_form_interest or "Bharatanatyam"
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

    plain_text = f"""
Welcome to NATYA AI, {name}!

Thank you for creating an account on NATYA AI - The Next-Gen Multimodal Classical Indian Dance AI Studio.

Your Account Details:
- Name: {name}
- Email: {email}
- Dance Form: {dance_form}
- Experience: {experience_level}
- Registered On: {now_str}

Explore our Classical Dance AI modules:
1. 3D MoCap Studio - 13 Interactive 3D Posture Models with 360-degree orbit.
2. AI Pose Analyzer - Real-time biomechanical skeleton alignment and joint angle feedback.
3. Digital Twin Studio - Compare your posture side-by-side with Guru reference postures.
4. Asamyukta & Samyukta Mudra Recognition - Computer Vision hand gesture classifier.
5. Tala & Rhythm Metronome - Classical Carnatic & Hindustani polyrhythmic metronome.
6. Natya Guru AI Assistant - Real-time multilingual conversational Natyashastra Guru.

Login to your dashboard now: http://localhost:5173/login

Natya AI • Preserving Heritage through Artificial Intelligence
"""

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NATYA AI</title>
  <style>
    body {{
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b1120;
      color: #f1f5f9;
      margin: 0;
      padding: 24px 12px;
    }}
    .email-container {{
      max-width: 620px;
      margin: 0 auto;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(245, 158, 11, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }}
    .header-banner {{
      background: linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%);
      padding: 36px 28px;
      text-align: center;
      border-bottom: 2px solid #fbbf24;
    }}
    .logo-badge {{
      display: inline-block;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(254, 240, 138, 0.4);
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 800;
      color: #fef08a;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }}
    .header-title {{
      margin: 0;
      color: #ffffff;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }}
    .header-sub {{
      margin: 8px 0 0 0;
      color: #fef3c7;
      font-size: 14px;
      font-weight: 500;
    }}
    .content-body {{
      padding: 32px 28px;
    }}
    .greeting {{
      font-size: 20px;
      font-weight: 800;
      color: #fef08a;
      margin-bottom: 14px;
    }}
    .paragraph {{
      font-size: 15px;
      line-height: 1.65;
      color: #cbd5e1;
      margin-bottom: 20px;
    }}
    .details-box {{
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 18px 20px;
      margin: 22px 0;
    }}
    .details-row {{
      display: flex;
      justify-content: space-between;
      padding: 7px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 14px;
    }}
    .details-row:last-child {{
      border-bottom: none;
    }}
    .details-label {{
      color: #94a3b8;
      font-weight: 600;
    }}
    .details-value {{
      color: #f8fafc;
      font-weight: 700;
    }}
    .features-grid {{
      margin: 24px 0;
    }}
    .feature-item {{
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .feature-icon {{
      font-size: 22px;
      line-height: 1;
    }}
    .feature-title {{
      font-size: 14px;
      font-weight: 700;
      color: #f1f5f9;
    }}
    .feature-desc {{
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
    }}
    .cta-button-container {{
      text-align: center;
      margin: 32px 0 16px 0;
    }}
    .cta-button {{
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #0f172a !important;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
      letter-spacing: 0.02em;
    }}
    .footer {{
      background: #090e1a;
      padding: 24px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 12px;
      color: #64748b;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <div class="logo-badge">🪔 NATYA AI STUDIO</div>
      <h1 class="header-title">Welcome to the Future of Classical Dance</h1>
      <p class="header-sub">Ancient Shastras Meet Next-Gen Artificial Intelligence</p>
    </div>

    <div class="content-body">
      <div class="greeting">Namaste, {name}! 🙏</div>
      <p class="paragraph">
        We are thrilled to welcome you to <strong>NATYA AI</strong>. Your dancer account has been created successfully. You now have full access to our multimodal classical dance analysis suite.
      </p>

      <div class="details-box">
        <div class="details-row">
          <span class="details-label">Dancer Name:</span>
          <span class="details-value">{name}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Registered Email:</span>
          <span class="details-value">{email}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Primary Dance Form:</span>
          <span class="details-value" style="color: #f59e0b;">{dance_form}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Experience Level:</span>
          <span class="details-value">{experience_level}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Registration Date:</span>
          <span class="details-value">{now_str}</span>
        </div>
      </div>

      <p class="paragraph" style="font-weight: 700; color: #fef08a; margin-bottom: 12px;">
        Explore your AI Classical Dance Toolkit:
      </p>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">✨</div>
          <div>
            <div class="feature-title">3D Interactive Motion Capture Studio</div>
            <div class="feature-desc">13 WebGL 3D anatomical posture models with 360° rotational orbit and MoCap JSON export.</div>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📸</div>
          <div>
            <div class="feature-title">AI Pose & Biomechanical Analysis</div>
            <div class="feature-desc">Upload photos or video for real-time joint angles, Aramandi flex, and Shastra alignment scores.</div>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🤲</div>
          <div>
            <div class="feature-title">Mudra Recognition & Tala Metronome</div>
            <div class="feature-desc">Detect Asamyukta & Samyukta hand gestures live via webcam and practice with Carnatic/Hindustani talas.</div>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🕉️</div>
          <div>
            <div class="feature-title">Natya Guru AI Assistant</div>
            <div class="feature-desc">Ask questions on Natyashastra theory, Abhinaya Darpana, mudra meanings, and choreographic tips.</div>
          </div>
        </div>
      </div>

      <div class="cta-button-container">
        <a href="http://localhost:5173/login" class="cta-button">
          Open NATYA AI Dashboard →
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">This email was sent to <strong>{email}</strong> regarding your NATYA AI account creation.</p>
      <p style="margin: 0;">© 2026 NATYA AI • Preserving Indian Classical Heritage with AI</p>
    </div>
  </div>
</body>
</html>
"""
    return _dispatch_email(email, subject, html_content, plain_text, notification_type="welcome_registration")


def send_login_alert_email(
    email: str,
    full_name: str = "",
    client_ip: str = "127.0.0.1",
    user_agent: str = ""
):
    """
    Dispatches a security notification email whenever the user signs into their account.
    """
    subject = "🔐 NATYA AI Security Alert: New Sign-in Detected"
    name = full_name.strip() if full_name else "Dancer"
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M:%S UTC")
    ua_clean = user_agent[:80] if user_agent else "Web Browser Client"

    plain_text = f"""
Security Alert: New Sign-in to your NATYA AI Account

Hello {name},

We detected a successful sign-in to your NATYA AI account.

Sign-in Details:
- Account Email: {email}
- Timestamp: {now_str}
- IP Address: {client_ip}
- Client Application: {ua_clean}

If this was you, no action is required. You can safely ignore this notification.

If you did not perform this login, please change your password immediately or contact our support team.

Login to your dashboard: http://localhost:5173/login

Natya AI Security Team • Preserving Heritage through Artificial Intelligence
"""

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NATYA AI Security Alert</title>
  <style>
    body {{
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b1120;
      color: #f1f5f9;
      margin: 0;
      padding: 24px 12px;
    }}
    .email-container {{
      max-width: 580px;
      margin: 0 auto;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(6, 182, 212, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }}
    .header-banner {{
      background: linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0891b2 100%);
      padding: 30px 24px;
      text-align: center;
      border-bottom: 2px solid #38bdf8;
    }}
    .logo-badge {{
      display: inline-block;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      color: #67e8f9;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }}
    .header-title {{
      margin: 0;
      color: #ffffff;
      font-size: 22px;
      font-weight: 900;
    }}
    .content-body {{
      padding: 28px 24px;
    }}
    .greeting {{
      font-size: 18px;
      font-weight: 800;
      color: #e2e8f0;
      margin-bottom: 12px;
    }}
    .paragraph {{
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 18px;
    }}
    .details-box {{
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 4px solid #06b6d4;
      border-radius: 8px;
      padding: 16px 18px;
      margin: 20px 0;
    }}
    .details-row {{
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 13px;
    }}
    .details-row:last-child {{
      border-bottom: none;
    }}
    .details-label {{
      color: #94a3b8;
      font-weight: 600;
    }}
    .details-value {{
      color: #f8fafc;
      font-weight: 700;
    }}
    .security-notice {{
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 13px;
      color: #fef08a;
      margin: 20px 0;
      line-height: 1.5;
    }}
    .cta-button-container {{
      text-align: center;
      margin: 24px 0 12px 0;
    }}
    .cta-button {{
      display: inline-block;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 800;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
    }}
    .footer {{
      background: #090e1a;
      padding: 20px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 11px;
      color: #64748b;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <div class="logo-badge">🔐 SECURITY ALERT</div>
      <h1 class="header-title">New Sign-in to NATYA AI</h1>
    </div>

    <div class="content-body">
      <div class="greeting">Hello {name},</div>
      <p class="paragraph">
        We detected a recent sign-in to your NATYA AI account. If this was you, you can safely disregard this message.
      </p>

      <div class="details-box">
        <div class="details-row">
          <span class="details-label">Account:</span>
          <span class="details-value">{email}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Date & Time:</span>
          <span class="details-value">{now_str}</span>
        </div>
        <div class="details-row">
          <span class="details-label">IP Address:</span>
          <span class="details-value">{client_ip}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Client Device:</span>
          <span class="details-value">{ua_clean}</span>
        </div>
      </div>

      <div class="security-notice">
        <strong>⚠️ Did not perform this sign-in?</strong><br>
        If you suspect unauthorized access, please update your account password immediately to secure your classical dance analysis datasets.
      </div>

      <div class="cta-button-container">
        <a href="http://localhost:5173" class="cta-button">
          Open NATYA AI →
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0;">This automated security alert was delivered to <strong>{email}</strong>.</p>
      <p style="margin: 0;">© 2026 NATYA AI • Indian Classical Dance AI Suite</p>
    </div>
  </div>
</body>
</html>
"""
    return _dispatch_email(email, subject, html_content, plain_text, notification_type="security_signin_alert")
