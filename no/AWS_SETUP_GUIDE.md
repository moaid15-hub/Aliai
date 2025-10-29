# AWS Amplify Deployment Guide

## 🚨 مشكلة الصلاحيات:
```
User: arn:aws:iam::060795908171:user/Muayad 
Error: not authorized to perform: amplify:CreateApp
```

## 🔧 الحل - إضافة Policies:

### 1. اذهب إلى AWS IAM Console:
https://console.aws.amazon.com/iam/

### 2. ابحث عن المستخدم: Muayad

### 3. أضف هذه Policies:
- `AWSAmplifyFullAccess`
- `AmazonS3FullAccess` 
- `CloudFormationFullAccess`
- `IAMFullAccess` (أو IAMLimitedAccess)

### 4. أو Policy مخصص:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "amplify:*",
                "s3:*",
                "cloudformation:*",
                "iam:PassRole",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:ListRoles",
                "lambda:*",
                "apigateway:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🚀 بعد إضافة الصلاحيات:
```bash
amplify init
amplify add hosting
amplify publish
```

## 📝 معلومات المشروع:
- AWS Account: 060795908171
- Region: eu-west-1
- Profile: oqoolai
- User: Muayad

## 🎯 الهدف:
نشر oqool.net على AWS Amplify بدلاً من Vercel