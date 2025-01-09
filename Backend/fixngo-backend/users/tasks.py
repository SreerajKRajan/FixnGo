from celery import shared_task
from django.core.mail import EmailMultiAlternatives

@shared_task
def send_otp_email(subject, text_content, html_content, recipient_email):
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email="FixnGo Team <sreerajkrajan03@gmail.com>",
        to=[recipient_email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()
