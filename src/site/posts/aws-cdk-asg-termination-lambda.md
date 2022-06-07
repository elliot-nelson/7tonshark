---
title: Custom Termination Policy w/CDK
subtitle: Create a custom termination policy using the AWS CDK.
description: Create a custom termination policy using the AWS CDK.
date: 2022-06-07
tags: [publish, cdk, typescript]
---

One of the features AWS offers for Auto Scaling Groups is the ability to create a [Custom Termination Policy](https://docs.aws.amazon.com/autoscaling/ec2/userguide/lambda-custom-termination-policy.html), by providing a Lambda Function that will be called when your ASG wants to scale in.

Unfortunately, the CDK [still doesn't support custom termination policies](https://github.com/aws/aws-cdk/issues/19750) (as of June 2022), but you can do it yourself by using an [escape hatch](https://docs.aws.amazon.com/cdk/v2/guide/cfn_layer.html) and manually adding the appropriate permissions.

```javascript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ExampleStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create an Auto Scaling Group
    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc: vpc, /* assume some pre-existing VPC */
      instanceType: new ec2.InstanceType('c5.xlarge'),
      machineImage: ec2.MachineImage.genericLinux({
        'us-east-1': 'ami-0b0ea68c435eb488d',
        'us-west-2': 'ami-0688ba7eeeeefe3cd'
      }),
      minCapacity: 1,
      maxCapacity: 25,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
      }
    });

    // Create a lambda function
    const terminationFunction = new lambda.Function(this, 'TerminationFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'AgentScaleInFunction.handler',
      code: lambda.Code.fromAsset('dist')
    });

    // Allow the function to be invoked by the ASG principal
    terminationFunction.addPermission('AllowInvokeByAutoScaling', {
      principal: new iam.ArnPrincipal(
        `arn:aws:iam::${Stack.of(this).account}:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling`
      )
    });

    // Use escape hatch to get the Cfn object for the ASG
    const cfnAsg = asg.node.defaultChild as autoscaling.CfnAutoScalingGroup;

    // Assign our lambda function as the termination policy
    cfnAsg.terminationPolicies = [terminationFunction.functionArn];
  }
}
```

For the termination function itself, that's up to you -- keep in mind that the ASG will only wait 2 seconds for a response from the function, so your decision process can't be too complex (or if it is complex, you'll need to do it elsewhere, perhaps in a separate lambda that tags your instances so you know which ones are safe to terminate).

Here's an example of a simple termination function that just returns the passed instances.

```javascript
import { AutoScalingScaleInHandler, AutoScalingScaleInEvent, Context } from 'aws-lambda';

export const handler: AutoScalingScaleInHandler = async (
  event: AutoScalingScaleInEvent,
  context: Context
) => {
  const instanceIdsToTerminate = event.Instances.map(instance => instance.InstanceId);

  // Insert your termination logic here.

  return {
    InstanceIDs: instanceIdsToTerminate
  };
};
```
