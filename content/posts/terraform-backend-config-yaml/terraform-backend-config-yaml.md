---
title: Keeping Terraform Config in YAML
date: 2025-11-03
tags: [terraform]
description: "Store service-specific and terraform backend configuration in shared YAML configuration files, for a simple way to deploy small projects."
banner_description: "Store service-specific and terraform backend configuration in shared YAML configuration files."
---

{% image "./banner.png", "Keeping Terraform Config in YAML" %}

When working on internal tools in Terraform, I like to have an easy pattern for configuration: something that is dead simple, easy to deploy to a few regions in a few accounts, but not requiring the full-blown production matrix of regions and environments.

Here's the setup I like to use.

## Configuration as YAML

First, for a lot of the basic "different by environment" values, I like to plug these into a YAML file that is separate from the main terraform.

My file setup is typically something like:

```text
infra/
  config/
    123456789012-us-east-1-prod.yaml
    123456789012-us-east-2-prod.yaml
    210987654321-us-east-2-dev.yaml
  terraform/
    main.tf
    locals.tf
    variables.tf
    (...)
```

Each YAML file is very simple and tailored to this particular service; you might put some hard-coded VPC ids here, the domain name to create, custom values that will be environment variables passed down to ECS, etc.

```yaml
# infra/config/123456789012-us-east-1-prod.yaml
config:
  domain-name: dynamite.corp.acme.com
  zone-domain-name: corp.acme.com
  vpc-id: vpc-aabbccddeeff34567
  private-subnets:
    - subnet-0a0b1234ff1235ff3
    - subnet-0a0b1234ff1235ff4
    - subnet-0a0b1234ff1235ff5
  public-subnets:
    - subnet-0a0b1234ff1235ff6
    - subnet-0a0b1234ff1235ff7
    - subnet-0a0b1234ff1235ff8
  bedrock-arns:
    - "arn:aws:bedrock:us-east-1:123456789012:foundation-model/anthropic.claude-sonnet-4-20250514-v1:0"
    - "arn:aws:bedrock:us-east-2:123456789012:foundation-model/anthropic.claude-sonnet-4-20250514-v1:0"
    - "arn:aws:bedrock:us-east-1:123456789012:inference-profile/us.anthropic.claude-sonnet-4-20250514-v1:0"
    - "arn:aws:bedrock:us-east-2:123456789012:inference-profile/us.anthropic.claude-sonnet-4-20250514-v1:0"
  service-environment: prod
```

You can use Terraform's built-in `yamldecode` to make your key/values easily accessible:

```hcl
# infra/terraform/locals.tf
locals {
  config = yamldecode(file("${path.module}/../config/${data.aws_caller_identity.current.account_id}-${data.aws_region.current.name}-${var.environment}.yaml")).config
}

# Refer to properties in the rest of your Terraform config,
# e.g. ${local.config.service-environment}.
```

## Why YAML?

Personally, I much prefer YAML over Terraform-specific files like `.hcl`, `.tfvars`, `.tftmpl` etc.

 * Universal -- YAML is trivially expressed as JSON which means you can use it anywhere.
 * Better syntax -- easily readable, built-in support for reusable content (via anchors/aliases), large arrays without commas.
 * It's much easier to validate. Terraform "validators" like tflint and checkhov exist, but you can easily run any external or home-grown validator against YAML data, ensure key properties exist or meet certain constraints, and so on.

When possible, I like to extract any important decisions I might want to change later out of the HCL and into YAML.

## Backend config

Unfortunately, backend configuration (for state file management) can't use locals, variables, or functions, so typically you would make stand-alone files right next to your YAML files, something like this:

```hcl
# infra/config/123456789012-us-east-1-prod.conf
bucket         = "acme-terraform-backend-prod"
key            = "dynamite-us-east-1-prod.tfstate"
region         = "us-east-1"
dynamodb_table = "acme-terraform-backend-prod"
```

The workflow that runs your init command then ends up looking something like this snippet:

```bash
cd infra/terraform
terraform init -backend-config=../config/${DEPLOY_ACCOUNT}-${DEPLOY_REGION}-${DEPLOY_ENVIRONMENT}.conf
```

This works fine, but it's a little annoying to have these 2 files tied together; we can do slightly better!

First, let's move all of our backend configuration directly into our YAML file:

```yaml
# infra/config/123456789012-us-east-1-prod.yaml
config:
  domain-name: dynamite.corp.acme.com
  zone-domain-name: corp.acme.com
  # ...
backend:
  bucket: acme-terraform-backend-prod
  key: dynamite-us-east-1-prod.tfstate
  region: us-east-1
  dynamodb_table: acme-terraform-backend-prod
```

Now, we know it's not possible to use `yamldecode` in a backend block, but we _can_ decode the YAML file separately and pass in specific key-value pairs as our backend config.

```bash
YAML_FILE="../config/${DEPLOY_ACCOUNT}-${DEPLOY_REGION}-${DEPLOY_ENVIRONMENT}.yaml"
echo "Initializing: $(<$YAML_FILE)"
yq -r '.backend | to_entries[] | "-backend-config \(.key)=\(.value)"' $YAML_FILE | xargs terraform init
```

Now we have a single YAML file representing the configuration for each state, with minimal magic wrappers.

## Expanding to multiple modules

For most non-trivial applications, you'll eventually need to start managing different state files (e.g. at minimum, your region-specific compute may need different lifecycle than your environment-specific database or CDN setup).

When possible, I like to keep _one config file_ (for `AWS Account` X `Region` X `Environment`), and refer to this config file from all modules. Here's an example folder structure:

```text
infra/
  config/
    123456789012-us-east-1-prod.yaml
    123456789012-us-east-2-prod.yaml
    210987654321-us-east-1-dev.yaml
  terraform/
    service/
      main.tf
      (...)
    cdn/
      main.tf
      (...)
    db/
      main.tf
      (...)
```

Instead of having a single key `config`, you can now have a top-level key for each component. This allows you to use your YAML files not only to describe _what the configuration options for an environment are_, but also _which modules to create in each environment_.

In this strategy, we'll use terraform to initialize and apply every combination of `module X config file` for an environment. If there's configuration for this module, we'll skip it.

Example:

```bash
YAML_FILE="../config/${DEPLOY_ACCOUNT}-${DEPLOY_REGION}-${DEPLOY_ENVIRONMENT}.yaml"

echo "Initializing: $(<$YAML_FILE)"

# Short-circuit if this component doesn't exist in this account/region
yq -e ".${COMPONENT}.backend" $YAML_FILE || exit 0

yq -o json $YAML_FILE | jq --arg component "$COMPONENT" -r '.[$component].backend | to_entries[] | "-backend-config \(.key)=\(.value)"' | xargs terraform init
```

> NOTE: Don't forget to move the `backend:` key underneath each component-specific top-level property, as each is intended to have its own state file. One advantage to keeping them all in one file is that most of the repeated values here can be entered only once, using YAML's built-in anchors and aliases.

## Next steps

For me, this setup is about the sweet spot for relatively simple deployments. If the service grows in size and scope, you could introduce more nice-to-haves -- for example, nested config files, or reusable YAMLs that can be loaded at the account or region level.

However, at that point, you are on your way to just reimplementing Terragrunt. So it might be worth looking into Terragrunt or similar existing wrappers. (One advantage to Terragrunt, since it wraps Terraform, is that it can use `yamldecode()` and pass resulting properties directly to Terraform's backend without any `yq | xargs` nonsense.)
