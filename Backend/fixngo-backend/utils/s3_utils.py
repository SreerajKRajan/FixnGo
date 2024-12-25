import boto3
import urllib.parse
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status

# AWS S3 Configuration
region_name = settings.AWS_S3_REGION_NAME
bucket_name = settings.AWS_STORAGE_BUCKET_NAME
s3_url_prefix = f"https://{bucket_name}.s3.{region_name}.amazonaws.com/"

# Initialize the S3 client
s3 = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=region_name,
)

# Function to get S3 file URL
def get_s3_file_url(file_name, s3_file_path):
    encoded_file_name = urllib.parse.quote(file_name)
    file_url = s3_url_prefix + s3_file_path + encoded_file_name
    print('Generated S3 file URL:', file_url)
    return file_url

# Function to upload file to S3
def upload_to_s3(image_file, s3_file_path):
    try:
        # Upload file to S3
        s3.upload_fileobj(
            image_file,
            bucket_name,
            s3_file_path + image_file.name,
            ExtraArgs={'ContentType': image_file.content_type}
        )
        # Generate the image URL
        image_url = get_s3_file_url(image_file.name, s3_file_path)
        print('Uploaded image URL:', image_url)
        return image_url
    except Exception as e:
        print('S3 upload error:', e)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Function to generate a pre-signed URL for S3 object
def generate_presigned_url(object_key, expiration=3600):
    """Generate a pre-signed URL to share an S3 object."""
    try:
        print(f"Object key passed to generate_presigned_url: {object_key}")
        response = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': object_key},
            ExpiresIn=expiration,
        )
        print('Generated presigned URL:', response)
        return response
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return Response({'error': 'Failed to generate pre-signed URL'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
