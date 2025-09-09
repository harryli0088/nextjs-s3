# AWS S3

To get this demo working with AWS S3
1. Create an AWS account
2. Create an AWS bucket
3. Create an AWS policy that has scoped access to the bucket
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::<your-bucket-name>/*"
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::<your-bucket-name>"
        }
    ]
}
```
4. Create a group that has this policy
5. Create an IAM user that is part of the group
6. Create access keys for the user and update the environment variables
7. Repeat the above steps for each environment (dov/staging/prod etc)

## Note about roles
AWS recommends that you have IAM roles instead of long-lived access keys through an IAM user.