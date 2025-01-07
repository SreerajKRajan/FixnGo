# users/tasks.py
from celery import shared_task
from django.core.mail import EmailMultiAlternatives

@shared_task
def send_otp_email(user_email, otp_code):
    subject = "Your FixnGo OTP Code"
    
    # Plain text content
    text_content = f"""
    Hello {user_email},
    
    Thank you for signing up with FixnGo!
    
    Your OTP code is: {otp_code}
    It will expire in 10 minutes. Please use this code to complete your registration.
    
    If you didn’t request this email, please ignore it.
    
    Best regards,
    The FixnGo Team
    """

    # HTML content
    html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #4CAF50; text-align: center;">Welcome to FixnGo!</h2>
                        <p>Hello <strong>{user.username}</strong>,</p>
                        <p>Thank you for signing up with <strong>FixnGo</strong>!</p>
                        <p style="font-size: 18px;">Your OTP code is:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <span style="
                                display: inline-block;
                                font-size: 24px;
                                font-weight: bold;
                                color: #ffffff;
                                background-color: #4CAF50;
                                padding: 10px 20px;
                                border-radius: 5px;
                                border: 1px solid #3e8e41;
                            ">
                                {otp_code}
                            </span>
                        </div>
                        <p style="color: #777;">This OTP is valid for <strong>10 minutes</strong>.</p>
                        <hr>
                        <p>If you didn’t request this email, please ignore it.</p>
                        <p>Best regards,</p>
                        <p style="font-weight: bold;">The FixnGo Team</p>
                    </div>
                </body>
            </html>
             """

    # Create email message
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email="FixnGo Team <sreerajkrajan03@gmail.com>",
        to=[user_email],
    )

    # Attach HTML content
    email.attach_alternative(html_content, "text/html")
    email.send()
