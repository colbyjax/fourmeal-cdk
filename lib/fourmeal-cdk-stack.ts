import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as iam from "@aws-cdk/aws-iam";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class FourmealCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   // The code that defines your stack goes here
   const vpc = new ec2.Vpc(this, "FourmealVPC", {
       maxAzs: 3
    });

    const cluster = new ecs.Cluster(this, "FourmealCluster", {
       vpc: vpc
    });

    const ecrRepoName = "fourmeal";

    // Ecr NOT USED - Left here if want to hook up
    const ecrRepo = ecr.Repository.fromRepositoryAttributes(
          this,
          ecrRepoName,
          {
            repositoryArn:  `arn:aws:ecr:us-west-1:881191887789:repository/${ecrRepoName}`,
            repositoryName: ecrRepoName
          }
        );

    // Create a role where permissions can be granted
    const taskRole = new iam.Role(this, "FourmealTaskWorkerRole", {
        assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Create a load-balanced Fargate service and make it public
    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "FourmealFargateService", {
       cluster: cluster,
       cpu: 512,
       desiredCount: 6,
       taskImageOptions: {
           image: ecs.ContainerImage.fromRegistry("colbyjax/fourmeal-app"),
           containerName: "fourmeal-container",
           enableLogging: true,
           taskRole: taskRole,
           containerPort: 5000
       },
       memoryLimitMiB: 2048,
       publicLoadBalancer: true,
       // Network Load Balancer Listener Port
       listenerPort: 8080
    });

   // Build DynamoDB Infrastructure
   const tableName = 'Meal';

   const table =  new dynamodb.Table(this, 'MealTable', {
        tableName,
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY
   });

   table.grantReadWriteData(taskRole);
  }
}
