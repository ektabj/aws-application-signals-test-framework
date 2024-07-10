"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdotE2EReleaseTestingStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
/*
This stack is for creating an EKS Cluster for release testing in the following repo:
https://github.com/aws-observability/aws-otel-java-instrumentation
*/
class AdotE2EReleaseTestingStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        var _a;
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Allow the following repositories to assume role with the IAM role
        // - aws-observability/aws-application-signals-test-framework
        // - aws-observability/aws-otel-python-instrumentation (temporarily until ADOT Python is public)
        // - aws-observability/aws-otel-java-instrumentation (temporarily until migration))
        const conditions = {
            StringLike: {
                ['token.actions.githubusercontent.com:sub']: [
                    'repo:aws-observability/aws-otel-java-instrumentation:ref:refs/heads/*',
                    'repo:aws-observability/aws-application-signals-test-framework:ref:refs/heads/*',
                    'repo:aws-observability/aws-otel-python-instrumentation:ref:refs/heads/*',
                ],
            },
        };
        // Create an IAM Role with an existing OIDC Identity Provider created in ../e2eTestCommonStack.ts
        const role = new aws_iam_1.Role(this, 'Adot-E2E-Github-Provider-Role', {
            assumedBy: new aws_iam_1.WebIdentityPrincipal('arn:aws:iam::654654176582:oidc-provider/token.actions.githubusercontent.com', conditions),
            managedPolicies: [aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            roleName: 'Adot-E2E-Github-Provider-Role',
        });
        // This allows developers to access the EKS cluster manually on the terminal
        (_a = role.assumeRolePolicy) === null || _a === void 0 ? void 0 : _a.addStatements(new aws_iam_1.PolicyStatement({
            actions: ['sts:AssumeRole'],
            principals: [new aws_iam_1.AccountRootPrincipal()],
        }));
        // Create an EKS cluster with a load balancer that will run the E2E tests
        const cluster = new aws_eks_1.Cluster(this, `e2e-adot-test`, {
            version: aws_eks_1.KubernetesVersion.V1_27,
            clusterName: `e2e-adot-test`,
            albController: { version: aws_eks_1.AlbControllerVersion.V2_4_7 },
            mastersRole: role,
        });
        new aws_eks_1.CfnIdentityProviderConfig(this, `adot-oidc-provider-configuration`, {
            clusterName: cluster.clusterName,
            type: 'oidc',
            oidc: {
                clientId: 'sts.amazonaws.com',
                issuerUrl: 'https://token.actions.githubusercontent.com',
            },
        });
        const rdsSecurityGroup = new aws_ec2_1.SecurityGroup(this, 'RdsSecurityGroup', {
            vpc: cluster.vpc,
            description: 'Security group for RDS Aurora cluster',
            allowAllOutbound: true,
        });
        // Add ingress rule to allow access from all IPv4 addresses
        rdsSecurityGroup.addIngressRule(aws_ec2_1.Peer.anyIpv4(), aws_ec2_1.Port.tcp(3306), 'Allow MySQL access from all IPv4');
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraAdotE2EClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraAdotE2EClusterForMySQL',
            storageType: aws_rds_1.DBClusterStorageType.AURORA,
            vpc: cluster.vpc,
            writer: aws_rds_1.ClusterInstance.provisioned('writer'),
            readers: [aws_rds_1.ClusterInstance.provisioned('reader')],
            deletionProtection: true,
            storageEncrypted: true,
            securityGroups: [rdsSecurityGroup],
        });
        const rdsClusterL1Construct = rdsCluster.node.defaultChild;
        rdsClusterL1Construct.addPropertyOverride('ManageMasterUserPassword', true);
        rdsClusterL1Construct.addPropertyOverride('MasterUsername', 'admin');
        rdsClusterL1Construct.addPropertyDeletionOverride('MasterUserPassword');
    }
}
exports.AdotE2EReleaseTestingStack = AdotE2EReleaseTestingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRvdEUyRVJlbGVhc2VUZXN0aW5nU3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWIvc3RhY2tzL3JlbGVhc2UtdGVzdGluZy9hZG90RTJFUmVsZWFzZVRlc3RpbmdTdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQ0FBZ0U7QUFFaEUsaURBQWtIO0FBQ2xILGlEQU82QjtBQUU3QixpREFBZ0U7QUFDaEUsaURBTzZCO0FBRTdCOzs7RUFHRTtBQUNGLE1BQWEsMEJBQTJCLFNBQVEsMkJBQWU7SUFDM0QsWUFBWSxNQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWlCOztRQUNwRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtZQUNoQixHQUFHLEtBQUs7WUFDUixZQUFZLEVBQUUsd0JBQVksQ0FBQyxjQUFjO1NBQzVDLENBQUMsQ0FBQztRQUVILG9FQUFvRTtRQUNwRSw2REFBNkQ7UUFDN0QsZ0dBQWdHO1FBQ2hHLG1GQUFtRjtRQUNuRixNQUFNLFVBQVUsR0FBZTtZQUMzQixVQUFVLEVBQUU7Z0JBQ1IsQ0FBQyx5Q0FBeUMsQ0FBQyxFQUFFO29CQUN6Qyx1RUFBdUU7b0JBQ3ZFLGdGQUFnRjtvQkFDaEYseUVBQXlFO2lCQUM1RTthQUNKO1NBQ0osQ0FBQztRQUVGLGlHQUFpRztRQUNqRyxNQUFNLElBQUksR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLEVBQUUsK0JBQStCLEVBQUU7WUFDekQsU0FBUyxFQUFFLElBQUksOEJBQW9CLENBQy9CLDZFQUE2RSxFQUM3RSxVQUFVLENBQ2I7WUFDRCxlQUFlLEVBQUUsQ0FBQyx1QkFBYSxDQUFDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDaEYsUUFBUSxFQUFFLCtCQUErQjtTQUM1QyxDQUFDLENBQUM7UUFFSCw0RUFBNEU7UUFDNUUsTUFBQSxJQUFJLENBQUMsZ0JBQWdCLDBDQUFFLGFBQWEsQ0FDaEMsSUFBSSx5QkFBZSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO1lBQzNCLFVBQVUsRUFBRSxDQUFDLElBQUksOEJBQW9CLEVBQUUsQ0FBQztTQUMzQyxDQUFDLENBQ0wsQ0FBQztRQUVGLHlFQUF5RTtRQUN6RSxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUMvQyxPQUFPLEVBQUUsMkJBQWlCLENBQUMsS0FBSztZQUNoQyxXQUFXLEVBQUUsZUFBZTtZQUM1QixhQUFhLEVBQUUsRUFBRSxPQUFPLEVBQUUsOEJBQW9CLENBQUMsTUFBTSxFQUFFO1lBQ3ZELFdBQVcsRUFBRSxJQUFJO1NBQ3BCLENBQUMsQ0FBQztRQUVILElBQUksbUNBQXlCLENBQUMsSUFBSSxFQUFFLGtDQUFrQyxFQUFFO1lBQ3BFLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztZQUNoQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRTtnQkFDRixRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixTQUFTLEVBQUUsNkNBQTZDO2FBQzNEO1NBQ0osQ0FBQyxDQUFDO1FBRUgsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHVCQUFhLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ2pFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELGdCQUFnQixFQUFFLElBQUk7U0FDekIsQ0FBQyxDQUFDO1FBRUgsMkRBQTJEO1FBQzNELGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxjQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsY0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1FBRXBHLE1BQU0sVUFBVSxHQUFHLElBQUkseUJBQWUsQ0FBQyxJQUFJLEVBQUUsaUNBQWlDLEVBQUU7WUFDNUUsTUFBTSxFQUFFLCtCQUFxQixDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxrQ0FBd0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMzRixpQkFBaUIsRUFBRSxpQ0FBaUM7WUFDcEQsV0FBVyxFQUFFLDhCQUFvQixDQUFDLE1BQU07WUFDeEMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO1lBQ2hCLE1BQU0sRUFBRSx5QkFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDN0MsT0FBTyxFQUFFLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGNBQWMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO1NBQ3JDLENBQUMsQ0FBQztRQUVILE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUE0QixDQUFDO1FBQzNFLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVFLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLHFCQUFxQixDQUFDLDJCQUEyQixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDNUUsQ0FBQztDQUNKO0FBbEZELGdFQWtGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlcGxveW1lbnRTdGFjaywgU29mdHdhcmVUeXBlIH0gZnJvbSAnQGFtem4vcGlwZWxpbmVzJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEFsYkNvbnRyb2xsZXJWZXJzaW9uLCBDZm5JZGVudGl0eVByb3ZpZGVyQ29uZmlnLCBDbHVzdGVyLCBLdWJlcm5ldGVzVmVyc2lvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0IHtcbiAgICBBY2NvdW50Um9vdFByaW5jaXBhbCxcbiAgICBDb25kaXRpb25zLFxuICAgIE1hbmFnZWRQb2xpY3ksXG4gICAgUG9saWN5U3RhdGVtZW50LFxuICAgIFJvbGUsXG4gICAgV2ViSWRlbnRpdHlQcmluY2lwYWwsXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgU3RhY2tQcm9wcyB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbW1vbic7XG5pbXBvcnQgeyBQZWVyLCBQb3J0LCBTZWN1cml0eUdyb3VwIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQge1xuICAgIERhdGFiYXNlQ2x1c3RlcixcbiAgICBEYXRhYmFzZUNsdXN0ZXJFbmdpbmUsXG4gICAgQXVyb3JhTXlzcWxFbmdpbmVWZXJzaW9uLFxuICAgIERCQ2x1c3RlclN0b3JhZ2VUeXBlLFxuICAgIENsdXN0ZXJJbnN0YW5jZSxcbiAgICBDZm5EQkNsdXN0ZXIsXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1yZHMnO1xuXG4vKlxuVGhpcyBzdGFjayBpcyBmb3IgY3JlYXRpbmcgYW4gRUtTIENsdXN0ZXIgZm9yIHJlbGVhc2UgdGVzdGluZyBpbiB0aGUgZm9sbG93aW5nIHJlcG86XG5odHRwczovL2dpdGh1Yi5jb20vYXdzLW9ic2VydmFiaWxpdHkvYXdzLW90ZWwtamF2YS1pbnN0cnVtZW50YXRpb25cbiovXG5leHBvcnQgY2xhc3MgQWRvdEUyRVJlbGVhc2VUZXN0aW5nU3RhY2sgZXh0ZW5kcyBEZXBsb3ltZW50U3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudDogQXBwLCBuYW1lOiBzdHJpbmcsIHByb3BzOiBTdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHBhcmVudCwgbmFtZSwge1xuICAgICAgICAgICAgLi4ucHJvcHMsXG4gICAgICAgICAgICBzb2Z0d2FyZVR5cGU6IFNvZnR3YXJlVHlwZS5JTkZSQVNUUlVDVFVSRSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWxsb3cgdGhlIGZvbGxvd2luZyByZXBvc2l0b3JpZXMgdG8gYXNzdW1lIHJvbGUgd2l0aCB0aGUgSUFNIHJvbGVcbiAgICAgICAgLy8gLSBhd3Mtb2JzZXJ2YWJpbGl0eS9hd3MtYXBwbGljYXRpb24tc2lnbmFscy10ZXN0LWZyYW1ld29ya1xuICAgICAgICAvLyAtIGF3cy1vYnNlcnZhYmlsaXR5L2F3cy1vdGVsLXB5dGhvbi1pbnN0cnVtZW50YXRpb24gKHRlbXBvcmFyaWx5IHVudGlsIEFET1QgUHl0aG9uIGlzIHB1YmxpYylcbiAgICAgICAgLy8gLSBhd3Mtb2JzZXJ2YWJpbGl0eS9hd3Mtb3RlbC1qYXZhLWluc3RydW1lbnRhdGlvbiAodGVtcG9yYXJpbHkgdW50aWwgbWlncmF0aW9uKSlcbiAgICAgICAgY29uc3QgY29uZGl0aW9uczogQ29uZGl0aW9ucyA9IHtcbiAgICAgICAgICAgIFN0cmluZ0xpa2U6IHtcbiAgICAgICAgICAgICAgICBbJ3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tOnN1YiddOiBbXG4gICAgICAgICAgICAgICAgICAgICdyZXBvOmF3cy1vYnNlcnZhYmlsaXR5L2F3cy1vdGVsLWphdmEtaW5zdHJ1bWVudGF0aW9uOnJlZjpyZWZzL2hlYWRzLyonLFxuICAgICAgICAgICAgICAgICAgICAncmVwbzphd3Mtb2JzZXJ2YWJpbGl0eS9hd3MtYXBwbGljYXRpb24tc2lnbmFscy10ZXN0LWZyYW1ld29yazpyZWY6cmVmcy9oZWFkcy8qJyxcbiAgICAgICAgICAgICAgICAgICAgJ3JlcG86YXdzLW9ic2VydmFiaWxpdHkvYXdzLW90ZWwtcHl0aG9uLWluc3RydW1lbnRhdGlvbjpyZWY6cmVmcy9oZWFkcy8qJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gSUFNIFJvbGUgd2l0aCBhbiBleGlzdGluZyBPSURDIElkZW50aXR5IFByb3ZpZGVyIGNyZWF0ZWQgaW4gLi4vZTJlVGVzdENvbW1vblN0YWNrLnRzXG4gICAgICAgIGNvbnN0IHJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnQWRvdC1FMkUtR2l0aHViLVByb3ZpZGVyLVJvbGUnLCB7XG4gICAgICAgICAgICBhc3N1bWVkQnk6IG5ldyBXZWJJZGVudGl0eVByaW5jaXBhbChcbiAgICAgICAgICAgICAgICAnYXJuOmF3czppYW06OjY1NDY1NDE3NjU4MjpvaWRjLXByb3ZpZGVyL3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tJyxcbiAgICAgICAgICAgICAgICBjb25kaXRpb25zLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG1hbmFnZWRQb2xpY2llczogW01hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBZG1pbmlzdHJhdG9yQWNjZXNzJyldLFxuICAgICAgICAgICAgcm9sZU5hbWU6ICdBZG90LUUyRS1HaXRodWItUHJvdmlkZXItUm9sZScsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGRldmVsb3BlcnMgdG8gYWNjZXNzIHRoZSBFS1MgY2x1c3RlciBtYW51YWxseSBvbiB0aGUgdGVybWluYWxcbiAgICAgICAgcm9sZS5hc3N1bWVSb2xlUG9saWN5Py5hZGRTdGF0ZW1lbnRzKFxuICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uczogWydzdHM6QXNzdW1lUm9sZSddLFxuICAgICAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgQWNjb3VudFJvb3RQcmluY2lwYWwoKV0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gRUtTIGNsdXN0ZXIgd2l0aCBhIGxvYWQgYmFsYW5jZXIgdGhhdCB3aWxsIHJ1biB0aGUgRTJFIHRlc3RzXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgQ2x1c3Rlcih0aGlzLCBgZTJlLWFkb3QtdGVzdGAsIHtcbiAgICAgICAgICAgIHZlcnNpb246IEt1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LFxuICAgICAgICAgICAgY2x1c3Rlck5hbWU6IGBlMmUtYWRvdC10ZXN0YCxcbiAgICAgICAgICAgIGFsYkNvbnRyb2xsZXI6IHsgdmVyc2lvbjogQWxiQ29udHJvbGxlclZlcnNpb24uVjJfNF83IH0sXG4gICAgICAgICAgICBtYXN0ZXJzUm9sZTogcm9sZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IENmbklkZW50aXR5UHJvdmlkZXJDb25maWcodGhpcywgYGFkb3Qtb2lkYy1wcm92aWRlci1jb25maWd1cmF0aW9uYCwge1xuICAgICAgICAgICAgY2x1c3Rlck5hbWU6IGNsdXN0ZXIuY2x1c3Rlck5hbWUsXG4gICAgICAgICAgICB0eXBlOiAnb2lkYycsXG4gICAgICAgICAgICBvaWRjOiB7XG4gICAgICAgICAgICAgICAgY2xpZW50SWQ6ICdzdHMuYW1hem9uYXdzLmNvbScsXG4gICAgICAgICAgICAgICAgaXNzdWVyVXJsOiAnaHR0cHM6Ly90b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbScsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByZHNTZWN1cml0eUdyb3VwID0gbmV3IFNlY3VyaXR5R3JvdXAodGhpcywgJ1Jkc1NlY3VyaXR5R3JvdXAnLCB7XG4gICAgICAgICAgICB2cGM6IGNsdXN0ZXIudnBjLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgUkRTIEF1cm9yYSBjbHVzdGVyJyxcbiAgICAgICAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBpbmdyZXNzIHJ1bGUgdG8gYWxsb3cgYWNjZXNzIGZyb20gYWxsIElQdjQgYWRkcmVzc2VzXG4gICAgICAgIHJkc1NlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoUGVlci5hbnlJcHY0KCksIFBvcnQudGNwKDMzMDYpLCAnQWxsb3cgTXlTUUwgYWNjZXNzIGZyb20gYWxsIElQdjQnKTtcblxuICAgICAgICBjb25zdCByZHNDbHVzdGVyID0gbmV3IERhdGFiYXNlQ2x1c3Rlcih0aGlzLCAnUmRzQXVyb3JhQWRvdEUyRUNsdXN0ZXJGb3JNeVNRTCcsIHtcbiAgICAgICAgICAgIGVuZ2luZTogRGF0YWJhc2VDbHVzdGVyRW5naW5lLmF1cm9yYU15c3FsKHsgdmVyc2lvbjogQXVyb3JhTXlzcWxFbmdpbmVWZXJzaW9uLlZFUl8zXzA0XzEgfSksXG4gICAgICAgICAgICBjbHVzdGVySWRlbnRpZmllcjogJ1Jkc0F1cm9yYUFkb3RFMkVDbHVzdGVyRm9yTXlTUUwnLFxuICAgICAgICAgICAgc3RvcmFnZVR5cGU6IERCQ2x1c3RlclN0b3JhZ2VUeXBlLkFVUk9SQSxcbiAgICAgICAgICAgIHZwYzogY2x1c3Rlci52cGMsXG4gICAgICAgICAgICB3cml0ZXI6IENsdXN0ZXJJbnN0YW5jZS5wcm92aXNpb25lZCgnd3JpdGVyJyksXG4gICAgICAgICAgICByZWFkZXJzOiBbQ2x1c3Rlckluc3RhbmNlLnByb3Zpc2lvbmVkKCdyZWFkZXInKV0sXG4gICAgICAgICAgICBkZWxldGlvblByb3RlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBzdG9yYWdlRW5jcnlwdGVkOiB0cnVlLFxuICAgICAgICAgICAgc2VjdXJpdHlHcm91cHM6IFtyZHNTZWN1cml0eUdyb3VwXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmRzQ2x1c3RlckwxQ29uc3RydWN0ID0gcmRzQ2x1c3Rlci5ub2RlLmRlZmF1bHRDaGlsZCBhcyBDZm5EQkNsdXN0ZXI7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdNYW5hZ2VNYXN0ZXJVc2VyUGFzc3dvcmQnLCB0cnVlKTtcbiAgICAgICAgcmRzQ2x1c3RlckwxQ29uc3RydWN0LmFkZFByb3BlcnR5T3ZlcnJpZGUoJ01hc3RlclVzZXJuYW1lJywgJ2FkbWluJyk7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eURlbGV0aW9uT3ZlcnJpZGUoJ01hc3RlclVzZXJQYXNzd29yZCcpO1xuICAgIH1cbn1cbiJdfQ==