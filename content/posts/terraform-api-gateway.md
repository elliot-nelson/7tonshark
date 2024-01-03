---
title: Moving from API Gateway v2 to API Gateway v1
date: 2024-04-20
tags: [terraform]
draft: true
---

I recently had to handle conversion of an existing website from AWS API Gateway v2 to AWS API Gateway v1. I've documented some of the tricky bits below for future reference.

## Permissions

In API Gateway v2, you can get away with simply creating a free-floating role that says "the principal API Gateway can invoke my lambda function", and you're done. In Terraform it looks like this:

```hcl
resource "aws_iam_role" "this" {
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [{
      "Sid" : "",
      "Effect" : "Allow",
      "Principal" : {
        "Service" : [
          "apigateway.amazonaws.com"
        ]
      },
      "Action" : [
        "sts:AssumeRole"
      ]
    }]
  })
  path = "/"
  inline_policy {
    name = "LambdaAccess"

    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Effect" : "Allow",
          "Action" : "lambda:InvokeFunction",
          "Resource" : "${aws_lambda_function.this.arn}"
        }
      ]
    })
  }
}
```

For API Gateway v1, you need to have a similar role, _and_ create a special lambda permission resource. While fiddling with my permissions I also took an extra step, which is that I attached the invocation policy directly to the role the lambda function uses to run; in hindsight that probably isn't necessary.

```hcl
resource "aws_iam_policy" "this" {
  name        = "${var.name}-invoke-policy"
  description = "Policy for invoking lambda from API Gateway v1"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "lambda:InvokeFunction"
        ],
        "Resource" : "${aws_lambda_function.this.arn}"
      }
    ]
  })
}

# Attach this invocation policy to the existing role passed in
resource "aws_iam_role_policy_attachment" "this" {
  policy_arn = aws_iam_policy.this.arn
  role       = data.aws_iam_role.lambda_role.name
}

resource "aws_lambda_permission" "this" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*"
}
```

## Configuring paths

The thing that stumped me here for quite a while is that there seems to be no way in API Gateway v1 to create a _true_ "catch-all" resource. Both the `$default` and the `{proxy+}` catch-all approaches fail to trigger if you hit the `/` (root) of your API Gateway stage. So, the thing to do is just configure separately the root resource, method, and integration objects in Terraform.

```hcl
# Set up the "catch all" integration

resource "aws_api_gateway_resource" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "$default"
}

resource "aws_api_gateway_method" "this" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.this.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "this" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.this.id
  http_method             = aws_api_gateway_method.this.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.this.invoke_arn
}

# Now set up the same integration for the root resource. Note that you don't CREATE
# the root resource -- attempting to create resource for "/" will generate an error.
# Instead we just construct a method for the existing root_resource.

resource "aws_api_gateway_method" "root" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_rest_api.this.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# Integrate API Gateway root route with Lambda function
resource "aws_api_gateway_integration" "root" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_rest_api.this.root_resource_id
  http_method             = aws_api_gateway_method.root.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.this.invoke_arn
}
```

## Deployments

Another unfortunate stumper. in API Gateway v2, when you create a stage, you can tell AWS to "auto-deploy" the stage, and then you just don't worry about deployments anymore. With API Gateway v1, manual triggers of the API are necessary unless you tell Terraform when to deploy, which resulted in days spent where I _thought_ I was testing my changes but actually was not.

I ended up with this nuclear option, that forces a redeployment if any property of any of my dependent resources has changed, to make sure I never had this problem again.

```hcl
resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.this,
      aws_api_gateway_method.this,
      aws_api_gateway_integration.this,
      aws_api_gateway_method.root,
      aws_api_gateway_integration.root
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}
```

## Lambda Event Changes

Be aware that the _event format_ is rather different between API Gateway v1 and API Gateway v2, so the actual code of your Lambda function (in our case TypeScript) will likely need to change.

Luckily most of these changes were straightforward in my case:

 - Import type `APIGatewayProxyEvent` instead of `APIGatewayProxyEventV2`
 - `event.requestContext.http.sourceIp` -> `event.requestContext.identity.sourceIp`
 - `event.rawPath` -> `event.path`
 - `event.requestContext.http.method` -> `event.requestContext.httpMethod`
 - and so on
