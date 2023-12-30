---
title: Dynamic Data Lookups in Terraform
date: 2024-04-20
tags: [terraform]
draft: true
---

In a recent project, I had a series of reusable AWS WAF IPSets defined in one Terraform project. Then, in many separate Terraform projects, I wanted to use various combinations of these IPSets when creating WAFs for different websites.

For each website, I have a simple JSON configuration file, and my goal was to add a section to this config file, like so:

```json
{
  "firewall": {
    "allowedIPSets": ["office", "vpn", "vendorA", "vendorB"]
  }
}
```

Let's explore how we could use this config file to dynamically lookup the existing IPSets in Terraform!

## Attempt 1: Direct Data Lookups

My first attempt was to add new `data` lookups directly to my website Terraform module. I've got IPv4 and IPv6 addresses in each category, so we could load them all up like so:

```tf
data "aws_wafv2_ip_set" "office-ipv4" {
  name  = "moonbeam-office-ipv4"
  scope = "CLOUDFRONT"
}

data "aws_wafv2_ip_set" "office-ipv6" {
  name  = "moonbeam-office-ipv6"
  scope = "CLOUDFRONT"
}

data "aws_wafv2_ip_set" "vpn-ipv4" {
  name  = "moonbeam-vpn-ipv4"
  scope = "CLOUDFRONT"
}

data "aws_wafv2_ip_set" "vpn-ipv6" {
  name  = "moonbeam-vpn-ipv6"
  scope = "CLOUDFRONT"
}

# ...and so on...
```

Then, in theory, we could try to use these data resources by creating dynamic `rule` entries on an `aws_wafv2_web_acl` resource:

```tf
  dynamic "rule" {
    for_each = var.allowedIPSets
    content {
      name     = "allowIPSet${index(var.allowedIPSets, rule.value) + 1}v4"
      priority = index(var.allowedIPSets, rule.value) + 40

      action {
        allow {}
      }

      statement {
        ip_set_reference_statement {
          # Next line is wrong...
          arn = data."shared-${rule.value}-ipv4".arn
        }
      }
    }
  }

  dynamic "rule" {
    for_each = var.allowedIPSets
    content {
      name     = "allowIPSet${index(var.allowedIPSets, rule.value) + 1}v6"
      priority = index(var.allowedIPSets, rule.value) + 60

      action {
        allow {}
      }

      statement {
        ip_set_reference_statement {
          # Next line is wrong...
          arn = data."moonbeam-${rule.value}-ipv6".arn
        }
      }
    }
  }
```

However, this doesn't work: Terraform doesn't allow "dynamic" lookups of data resources this way, because the list of dependent resources needs to be determined before variable values are determined.

To avoid this error, we can add a level of indirection by wrapping our IPSets in a separate Terraform module.

## Attempt 2: Use a separate module

Let's create a new module, `shared-ipsets`, and move our Terraform definition over there:

```tf
# data.tf

data "aws_wafv2_ip_set" "office-ipv4" {
  name  = "moonbeam-office-ipv4"
  scope = "CLOUDFRONT"
}

data "aws_wafv2_ip_set" "office-ipv6" {
  name  = "moonbeam-office-ipv6"
  scope = "CLOUDFRONT"
} # and etc...

# locals.tf

locals {
  ipsets = {
    shared-office-ipv4  = data.aws_wafv2_ip_set.shared-office-ipv4
    shared-office-ipv6  = data.aws_wafv2_ip_set.shared-office-ipv6
    shared-vpn-ipv4     = data.aws_wafv2_ip_set.shared-vpn-ipv4
    shared-vpn-ipv6     = data.aws_wafv2_ip_set.shared-vpn-ipv6
    shared-vendorA-ipv4 = data.aws_wafv2_ip_set.shared-vendorA-ipv4
    shared-vendorA-ipv6 = data.aws_wafv2_ip_set.shared-vendorA-ipv6
    shared-vendorB-ipv4 = data.aws_wafv2_ip_set.shared-vendorB-ipv4
    shared-vendorB-ipv6 = data.aws_wafv2_ip_set.shared-vendorB-ipv6
  }
}

# outputs.tf

output "ipsets" {
  value = local.ipsets
}
```

In this Terraform module, we list out all of the possible IPSets we might use, and then we can access them in our WAF definition. Instead of attempting to access a dynamic data object, we'll refer to our `ipsets` output:

```tf
# Add the ipsets module

module "shared-ipsets" {
  source = "../shared-ipsets"
}

# Now, in the ip_set_reference_statements:

      statement {
        ip_set_reference_statement {
          arn = module.shared-ipsets.ipsets["shared-${rule.value}-ipv4"].arn
        }
      }

# ...

      statement {
        ip_set_reference_statement {
          arn = module.shared-ipsets.ipsets["shared-${rule.value}-ipv6"].arn
        }
      }

```

Success -- each of our Terraform website projects loads up our data resources and then builds IPSet reference rules for the ones used by that individual website.

## Attempt 3: Add a second module layer

Although the last approach works just fine, one downside is that _each_ website loads up a data reference for every possible IPSet, even if that website won't attach that IPSet to its WAF. This isn't a big deal if there are only 4 IPSets, but as the list grows into 20-30 possibilities, it can begin to affect Terraform planning time and output size.

We can optimize this by introducing a new, final layer of module indirection, wrapping each individual IPSet reference into its own module. In this setup, we'll have the `shared-ipsets` module and then a `shared-ipset` module (singular) underneath it.

First, we'll define the individual `shared-ipset` module, which takes a single string variable `name` and returns an `ipsets` object, just like the one from above, but only containing the entries for that individual named IPSet.

```tf
# variables.tf

variable "name" {
  type = string
}

# data.tf

data "aws_wafv2_ip_set" "this-ipv4" {
  name  = "shared-${var.name}-ipv4"
  scope = "CLOUDFRONT"
}

data "aws_wafv2_ip_set" "this-ipv6" {
  name  = "shared-${var.name}-ipv6"
  scope = "CLOUDFRONT"
}

# locals.tf

locals {
  ipsets = {
    "shared-${var.name}-ipv4" = data.aws_wafv2_ip_set.this-ipv4
    "shared-${var.name}-ipv6" = data.aws_wafv2_ip_set.this-ipv6
  }
}

# outputs.tf

output "ipsets" {
  value = local.ipsets
}
```

Now that we have this new building block, let's adjust our `shared-ipsets` module to use this module, eliminating the hard-coded list of possible IPSets:

```tf
# variables.tf

variable "names" {
  type = list(string)
}

# main.tf

module "ipsets" {
  source   = "../shared-ipset"
  for_each = toset(var.names)
  name     = each.key
}

# outputs.tf

output "ipsets" {
  value       = merge(values(module.ipsets)[*].ipsets...)
}
```

Our `shared-ipsets` module now takes a list of the names to load, merging the results together and returning a single map, just like the old version did. Since this new version has the exact same outputs that the old one did, we don't have to adjust anything in our website module except the module definition:

```tf
module "shared-ipsets" {
  source = "../shared-ipsets"
  names  = var.allowedIPSets
}
```

A new terraform plan run confirms that we have the same plan output, _but_, we only have data load lines in the plan for the IPSets that the website actually lists in its configuration file. Nice!
