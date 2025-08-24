$AccountId   = "619126148872"
$Region      = "ap-southeast-1"
$LambdaName  = "UpdateRates"
$RoleName    = "SchedulerInvokeLambdaRole"
$ScheduleName = "UpdateRatesTwiceDaily"

# Get Lambda ARN
$LambdaArn = "arn:aws:lambda:${Region}:${AccountId}:function:${LambdaName}"

# -------------------------------
# 1. Create IAM role trust policy for Scheduler, so Scheduler can invoke Lambda
# -------------------------------
$TrustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "scheduler.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@

$TrustPolicyFile = "trust-policy.json"
$TrustPolicy | Out-File -FilePath $TrustPolicyFile -Encoding ascii

aws iam create-role `
    --role-name $RoleName `
    --assume-role-policy-document file://$TrustPolicyFile `
    --region $Region

# -------------------------------
# 2. Attach inline policy to allow invocation of Lambda
# -------------------------------
$InvokePolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "$LambdaArn"
    }
  ]
}
"@

$InvokePolicyFile = "invoke-policy.json"
$InvokePolicy | Out-File -FilePath $InvokePolicyFile -Encoding ascii

aws iam put-role-policy `
    --role-name $RoleName `
    --policy-name "AllowInvokeUpdateRatesLambda" `
    --policy-document file://$InvokePolicyFile `
    --region $Region

# -------------------------------
# 3. Create EventBridge Scheduler schedule. Runs daily at 09:00 and 21:00 SGT
# -------------------------------
$RoleArn = "arn:aws:iam::${AccountId}:role/$RoleName"

aws scheduler create-schedule `
    --name $ScheduleName `
    --description "Invoke UpdateRates Lambda twice daily" `
    --schedule-expression "cron(0 9,21 * * ? *)" `
    --schedule-expression-timezone "Asia/Singapore" `
    --flexible-time-window Mode=OFF `
    --target "Arn=$LambdaArn,RoleArn=$RoleArn" `
    --region $Region
