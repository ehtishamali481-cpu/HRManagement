import os
import random
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("uvicorn")


def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"


def _dispatch_email(recipient_email: str, subject: str, html_content: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from = os.getenv("SMTP_FROM", "").strip() or smtp_user or "no-reply@nexushr.internal"

    if not smtp_host or not smtp_user:
        logger.info(f"[EMAIL DISPATCH - DEV SIMULATION] Recipient: {recipient_email} | Subject: {subject}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_from
        msg["To"] = recipient_email
        msg.attach(MIMEText(html_content, "html"))

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=12) as server:
                if smtp_user and smtp_password:
                    server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, recipient_email, msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as server:
                try:
                    server.starttls()
                except Exception:
                    pass
                if smtp_user and smtp_password:
                    server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, recipient_email, msg.as_string())

        logger.info(f"[EMAIL SUCCESS] Delivered to {recipient_email} via {smtp_host}:{smtp_port}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL ERROR] Failed to send to {recipient_email}: {e}")
        return False


def send_otp_email(recipient_email: str, otp: str, user_name: str = "User") -> bool:
    logger.info("=" * 60)
    logger.info(f"[OTP CODE GENERATED] For: {recipient_email} | OTP: {otp} | User: {user_name}")
    logger.info("=" * 60)

    subject = f"{otp} is your NexusHR Verification Code"
    html_content = f"""
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">Welcome to NexusHR</h2>
          <p style="color: #475569; font-size: 15px;">Hello {user_name},</p>
          <p style="color: #475569; font-size: 15px;">Use the verification code below to verify your email address and activate your enterprise workspace:</p>
          <div style="margin: 28px 0; text-align: center;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 28px; border-radius: 8px; border: 1px dashed #6366f1;">
              {otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this verification, please disregard this email.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">NexusHR Enterprise Workforce Core • SOC2 Type II Certified</p>
        </div>
      </body>
    </html>
    """
    return _dispatch_email(recipient_email, subject, html_content)


def send_forgot_password_email(recipient_email: str, otp: str, user_name: str = "User") -> bool:
    logger.info("=" * 60)
    logger.info(f"[FORGOT PASSWORD OTP] For: {recipient_email} | Reset Code: {otp} | User: {user_name}")
    logger.info("=" * 60)

    subject = f"{otp} is your NexusHR Password Reset Code"
    html_content = f"""
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">NexusHR Security Alert</h2>
          <p style="color: #475569; font-size: 15px;">Hello {user_name},</p>
          <p style="color: #475569; font-size: 15px;">We received a request to reset your password. Use the verification code below to set a new password:</p>
          <div style="margin: 28px 0; text-align: center;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #e11d48; background: #fff1f2; padding: 12px 28px; border-radius: 8px; border: 1px dashed #f43f5e;">
              {otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request a password reset, please contact your workspace administrator immediately.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">NexusHR Security Operations • Automated Dispatch</p>
        </div>
      </body>
    </html>
    """
    return _dispatch_email(recipient_email, subject, html_content)


def send_new_employee_welcome_email(
    recipient_email: str,
    employee_name: str,
    role_title: str,
    temporary_password: str,
    company_name: str = "Acme Global Technologies Inc.",
) -> bool:
    logger.info("=" * 60)
    logger.info(f"[NEW EMPLOYEE ONBOARDING DISPATCH] To: {recipient_email} | Employee: {employee_name} | Role: {role_title} | Temp Password: {temporary_password}")
    logger.info("=" * 60)

    subject = f"Welcome to {company_name} - Your NexusHR Workspace Account"
    html_content = f"""
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">Welcome to {company_name}!</h2>
          <p style="color: #475569; font-size: 15px;">Hello {employee_name},</p>
          <p style="color: #475569; font-size: 15px;">Your employee profile and credentials have been created as <strong>{role_title}</strong>.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;"><strong>Login Portal:</strong> <a href="http://localhost:5173/login" style="color: #4f46e5;">http://localhost:5173/login</a></p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;"><strong>Work Email:</strong> {recipient_email}</p>
            <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">{temporary_password}</code></p>
          </div>

          <p style="color: #64748b; font-size: 13px;">Please log in to review your onboarding checklist, set up your direct deposit details, and change your password.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">NexusHR Automated People Partner • Secured by SOC2 Compliance</p>
        </div>
      </body>
    </html>
    """
    return _dispatch_email(recipient_email, subject, html_content)
