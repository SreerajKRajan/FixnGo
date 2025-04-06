import boto3, logging
import urllib.parse
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from botocore.exceptions import ClientError

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
        # Make sure the file path doesn't already contain S3 URLs
        if s3_file_path.startswith('http') and 'amazonaws.com' in s3_file_path:
            # Extract just the relative path
            parts = s3_file_path.split('amazonaws.com/')
            if len(parts) > 1:
                s3_file_path = parts[1]
        
        # Make sure the file path ends with a slash
        if not s3_file_path.endswith('/'):
            s3_file_path += '/'
            
        # Upload file to S3
        s3.upload_fileobj(
            image_file,
            bucket_name,
            s3_file_path + image_file.name,
            ExtraArgs={'ContentType': image_file.content_type}
        )
        
        # Generate the image URL - make sure it's a direct URL
        file_key = s3_file_path + image_file.name
        
        
        print('Uploaded image URL:', file_key)
        return file_key
    except Exception as e:
        print('S3 upload error:', e)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Function to generate a pre-signed URL for S3 object
def generate_presigned_url(document_url, expiration=3600):
    """Generate a presigned URL to share an S3 object

    :param bucket_name: string
    :param object_name: string
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """

    try:
        response = s3.generate_presigned_url('get_object',
                                                    Params={'Bucket': bucket_name,
                                                            'Key': document_url},
                                                    ExpiresIn=expiration)
    except ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL
    return response
