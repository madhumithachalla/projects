# BirdTag — Auth & Secure Upload (representative demo)
#
# This is a standalone reconstruction of the piece of BirdTag I personally built:
# Cognito-authenticated access + a signed S3 upload endpoint. It is NOT the actual
# team submission — BirdTag was a 4-person Monash assignment, and I'm not
# reproducing shared/team-owned code here. This demo shows the pattern I used,
# written fresh, so you can see how the piece I owned actually works.
#
# Stack: AWS Lambda, API Gateway (Cognito authorizer), S3 (presigned URLs)

import json
import os
import uuid
import boto3

s3 = boto3.client("s3")
BUCKET_NAME = os.environ.get("MEDIA_BUCKET", "birdtag-media-demo")
UPLOAD_EXPIRY_SECONDS = 300


def lambda_handler(event, context):
    """
    API Gateway invokes this behind a Cognito User Pool authorizer, so by the
    time this code runs, `event['requestContext']['authorizer']['claims']`
    already contains a verified, signed-in user. No unauthenticated request
    reaches this function.
    """
    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        user_id = claims["sub"]
    except (KeyError, TypeError):
        return _response(401, {"error": "Unauthorized — missing or invalid Cognito claims"})

    body = json.loads(event.get("body") or "{}")
    file_name = body.get("fileName")
    content_type = body.get("contentType", "application/octet-stream")

    if not file_name:
        return _response(400, {"error": "fileName is required"})

    object_key = f"uploads/{user_id}/{uuid.uuid4()}_{file_name}"

    presigned_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": BUCKET_NAME,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=UPLOAD_EXPIRY_SECONDS,
    )

    return _response(200, {
        "uploadUrl": presigned_url,
        "objectKey": object_key,
        "expiresIn": UPLOAD_EXPIRY_SECONDS,
    })


def _response(status_code, body_dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps(body_dict),
    }
