# IA Service (AWS Lambda)

## Overview
The **IA Service** is a lightweight, serverless Python function designed to run on AWS Lambda. It acts as an intelligent assistant for the UCE Lab Management System, primarily responsible for analyzing natural language incident reports and automatically determining their **severity** (ALTA, MEDIA, BAJA) and **category** (HARDWARE, SOFTWARE, RED, INFRAESTRUCTURA, OTRO).

By moving this AI capability to a serverless Lambda function, we decouple compute-intensive or Python-specific NLP tasks from our core NestJS microservices.

## Architecture
- **Environment**: AWS Lambda (Python 3.x)
- **Trigger**: AWS API Gateway (or Function URL) invoked via HTTP POST from the `incident-service`.
- **Stateless**: The Lambda function does not maintain state or connect to a database. It purely receives text, processes it, and returns a JSON classification.

## Tech Stack
- **Language**: Python 3.12+
- **Input**: JSON `{"description": "El monitor no enciende..."}`
- **Output**: JSON `{"severity": "ALTA", "category": "HARDWARE"}`

## Deployment (AWS Academy Restrictions)
Since the UCE system is deployed within an AWS Academy account, we **cannot create new IAM Roles**. This Lambda function MUST be deployed using the pre-existing `LabRole`.

### Manual Deployment Steps:
1. Log into the AWS Console.
2. Go to AWS Lambda and click **Create function**.
3. Choose **Author from scratch**.
4. Name: `ia-incident-analyzer`.
5. Runtime: `Python 3.12` (or latest).
6. **Permissions**: Expand "Change default execution role". Select **Use an existing role** and choose **`LabRole`**.
7. Click **Create function**.
8. Copy the code from `lambda_function.py` into the inline editor.
9. Click **Deploy**.
10. Add a **Function URL** or an **API Gateway** trigger (HTTP API, open/public for testing, or secured with IAM if required by your network).
11. Copy the generated URL into your GitHub Secrets (`PROD_IA_LAMBDA_URL`) or local `.env` (`IA_LAMBDA_URL`).

## Local Testing
You can test the logic locally using standard Python tools:
```bash
python -c "from lambda_function import lambda_handler; print(lambda_handler({'body': '{\"description\":\"cable pelado\"}'}, None))"
```
