"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnablementScriptE2EReleaseTestingStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
/*
This stack is for creating an EKS Cluster for release testing in the following repo:
https://github.com/aws-observability/application-signals-demo
*/
class EnablementScriptE2EReleaseTestingStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        var _a;
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Allow the aws-observability/application-signals-demo repo to assume role with the IAM role
        const conditions = {
            StringLike: {
                ['token.actions.githubusercontent.com:sub']: 'repo:aws-observability/application-signals-demo:ref:refs/heads/*',
            },
        };
        // Create an IAM Role with an existing OIDC Identity Provider created in ../e2eTestCommonStack.ts
        const role = new aws_iam_1.Role(this, 'Enablement-Script-E2E-Github-Provider-Role', {
            assumedBy: new aws_iam_1.WebIdentityPrincipal('arn:aws:iam::654654176582:oidc-provider/token.actions.githubusercontent.com', conditions),
            managedPolicies: [aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            roleName: 'Enablement-Script-E2E-Github-Provider-Role',
        });
        // This allows developers to access the EKS cluster manually on the terminal
        (_a = role.assumeRolePolicy) === null || _a === void 0 ? void 0 : _a.addStatements(new aws_iam_1.PolicyStatement({
            actions: ['sts:AssumeRole'],
            principals: [new aws_iam_1.AccountRootPrincipal()],
        }));
        // Create an EKS cluster with a load balancer that will run the E2E tests
        const cluster = new aws_eks_1.Cluster(this, `e2e-enablement-script-test`, {
            version: aws_eks_1.KubernetesVersion.V1_27,
            clusterName: `e2e-enablement-script-test`,
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
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraEnablementScriptPythonE2EClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraEnablementScriptPythonE2EClusterForMySQL',
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
exports.EnablementScriptE2EReleaseTestingStack = EnablementScriptE2EReleaseTestingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5hYmxlbWVudFNjcmlwdEUyRVJlbGVhc2VUZXN0aW5nU3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWIvc3RhY2tzL3JlbGVhc2UtdGVzdGluZy9lbmFibGVtZW50U2NyaXB0RTJFUmVsZWFzZVRlc3RpbmdTdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBZ0U7QUFDaEUsaURBQWtIO0FBQ2xILGlEQU82QjtBQUU3QixpREFBZ0U7QUFDaEUsaURBTzZCO0FBRTdCOzs7RUFHRTtBQUNGLE1BQWEsc0NBQXVDLFNBQVEsMkJBQWU7SUFDdkUsWUFBWSxNQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWlCOztRQUNwRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtZQUNoQixHQUFHLEtBQUs7WUFDUixZQUFZLEVBQUUsd0JBQVksQ0FBQyxjQUFjO1NBQzVDLENBQUMsQ0FBQztRQUVILDZGQUE2RjtRQUM3RixNQUFNLFVBQVUsR0FBZTtZQUMzQixVQUFVLEVBQUU7Z0JBQ1IsQ0FBQyx5Q0FBeUMsQ0FBQyxFQUN2QyxrRUFBa0U7YUFDekU7U0FDSixDQUFDO1FBRUYsaUdBQWlHO1FBQ2pHLE1BQU0sSUFBSSxHQUFHLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSw0Q0FBNEMsRUFBRTtZQUN0RSxTQUFTLEVBQUUsSUFBSSw4QkFBb0IsQ0FDL0IsNkVBQTZFLEVBQzdFLFVBQVUsQ0FDYjtZQUNELGVBQWUsRUFBRSxDQUFDLHVCQUFhLENBQUMsd0JBQXdCLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUNoRixRQUFRLEVBQUUsNENBQTRDO1NBQ3pELENBQUMsQ0FBQztRQUVILDRFQUE0RTtRQUM1RSxNQUFBLElBQUksQ0FBQyxnQkFBZ0IsMENBQUUsYUFBYSxDQUNoQyxJQUFJLHlCQUFlLENBQUM7WUFDaEIsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDM0IsVUFBVSxFQUFFLENBQUMsSUFBSSw4QkFBb0IsRUFBRSxDQUFDO1NBQzNDLENBQUMsQ0FDTCxDQUFDO1FBRUYseUVBQXlFO1FBQ3pFLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUU7WUFDNUQsT0FBTyxFQUFFLDJCQUFpQixDQUFDLEtBQUs7WUFDaEMsV0FBVyxFQUFFLDRCQUE0QjtZQUN6QyxhQUFhLEVBQUUsRUFBRSxPQUFPLEVBQUUsOEJBQW9CLENBQUMsTUFBTSxFQUFFO1lBQ3ZELFdBQVcsRUFBRSxJQUFJO1NBQ3BCLENBQUMsQ0FBQztRQUVILElBQUksbUNBQXlCLENBQUMsSUFBSSxFQUFFLGtDQUFrQyxFQUFFO1lBQ3BFLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztZQUNoQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRTtnQkFDRixRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixTQUFTLEVBQUUsNkNBQTZDO2FBQzNEO1NBQ0osQ0FBQyxDQUFDO1FBRUgsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHVCQUFhLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ2pFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELGdCQUFnQixFQUFFLElBQUk7U0FDekIsQ0FBQyxDQUFDO1FBRUgsMkRBQTJEO1FBQzNELGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxjQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsY0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1FBRXBHLE1BQU0sVUFBVSxHQUFHLElBQUkseUJBQWUsQ0FBQyxJQUFJLEVBQUUsbURBQW1ELEVBQUU7WUFDOUYsTUFBTSxFQUFFLCtCQUFxQixDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxrQ0FBd0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMzRixpQkFBaUIsRUFBRSxtREFBbUQ7WUFDdEUsV0FBVyxFQUFFLDhCQUFvQixDQUFDLE1BQU07WUFDeEMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO1lBQ2hCLE1BQU0sRUFBRSx5QkFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDN0MsT0FBTyxFQUFFLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGNBQWMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO1NBQ3JDLENBQUMsQ0FBQztRQUVILE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUE0QixDQUFDO1FBQzNFLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVFLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLHFCQUFxQixDQUFDLDJCQUEyQixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDNUUsQ0FBQztDQUNKO0FBNUVELHdGQTRFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IERlcGxveW1lbnRTdGFjaywgU29mdHdhcmVUeXBlIH0gZnJvbSAnQGFtem4vcGlwZWxpbmVzJztcbmltcG9ydCB7IENsdXN0ZXIsIEt1YmVybmV0ZXNWZXJzaW9uLCBBbGJDb250cm9sbGVyVmVyc2lvbiwgQ2ZuSWRlbnRpdHlQcm92aWRlckNvbmZpZyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0IHtcbiAgICBSb2xlLFxuICAgIFdlYklkZW50aXR5UHJpbmNpcGFsLFxuICAgIE1hbmFnZWRQb2xpY3ksXG4gICAgQ29uZGl0aW9ucyxcbiAgICBBY2NvdW50Um9vdFByaW5jaXBhbCxcbiAgICBQb2xpY3lTdGF0ZW1lbnQsXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgU3RhY2tQcm9wcyB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbW1vbic7XG5pbXBvcnQgeyBQZWVyLCBQb3J0LCBTZWN1cml0eUdyb3VwIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQge1xuICAgIERhdGFiYXNlQ2x1c3RlcixcbiAgICBEYXRhYmFzZUNsdXN0ZXJFbmdpbmUsXG4gICAgQXVyb3JhTXlzcWxFbmdpbmVWZXJzaW9uLFxuICAgIERCQ2x1c3RlclN0b3JhZ2VUeXBlLFxuICAgIENsdXN0ZXJJbnN0YW5jZSxcbiAgICBDZm5EQkNsdXN0ZXIsXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1yZHMnO1xuXG4vKlxuVGhpcyBzdGFjayBpcyBmb3IgY3JlYXRpbmcgYW4gRUtTIENsdXN0ZXIgZm9yIHJlbGVhc2UgdGVzdGluZyBpbiB0aGUgZm9sbG93aW5nIHJlcG86XG5odHRwczovL2dpdGh1Yi5jb20vYXdzLW9ic2VydmFiaWxpdHkvYXBwbGljYXRpb24tc2lnbmFscy1kZW1vXG4qL1xuZXhwb3J0IGNsYXNzIEVuYWJsZW1lbnRTY3JpcHRFMkVSZWxlYXNlVGVzdGluZ1N0YWNrIGV4dGVuZHMgRGVwbG95bWVudFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6IEFwcCwgbmFtZTogc3RyaW5nLCBwcm9wczogU3RhY2tQcm9wcykge1xuICAgICAgICBzdXBlcihwYXJlbnQsIG5hbWUsIHtcbiAgICAgICAgICAgIC4uLnByb3BzLFxuICAgICAgICAgICAgc29mdHdhcmVUeXBlOiBTb2Z0d2FyZVR5cGUuSU5GUkFTVFJVQ1RVUkUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFsbG93IHRoZSBhd3Mtb2JzZXJ2YWJpbGl0eS9hcHBsaWNhdGlvbi1zaWduYWxzLWRlbW8gcmVwbyB0byBhc3N1bWUgcm9sZSB3aXRoIHRoZSBJQU0gcm9sZVxuICAgICAgICBjb25zdCBjb25kaXRpb25zOiBDb25kaXRpb25zID0ge1xuICAgICAgICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICAgICAgICAgIFsndG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb206c3ViJ106XG4gICAgICAgICAgICAgICAgICAgICdyZXBvOmF3cy1vYnNlcnZhYmlsaXR5L2FwcGxpY2F0aW9uLXNpZ25hbHMtZGVtbzpyZWY6cmVmcy9oZWFkcy8qJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIElBTSBSb2xlIHdpdGggYW4gZXhpc3RpbmcgT0lEQyBJZGVudGl0eSBQcm92aWRlciBjcmVhdGVkIGluIC4uL2UyZVRlc3RDb21tb25TdGFjay50c1xuICAgICAgICBjb25zdCByb2xlID0gbmV3IFJvbGUodGhpcywgJ0VuYWJsZW1lbnQtU2NyaXB0LUUyRS1HaXRodWItUHJvdmlkZXItUm9sZScsIHtcbiAgICAgICAgICAgIGFzc3VtZWRCeTogbmV3IFdlYklkZW50aXR5UHJpbmNpcGFsKFxuICAgICAgICAgICAgICAgICdhcm46YXdzOmlhbTo6NjU0NjU0MTc2NTgyOm9pZGMtcHJvdmlkZXIvdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbnMsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FkbWluaXN0cmF0b3JBY2Nlc3MnKV0sXG4gICAgICAgICAgICByb2xlTmFtZTogJ0VuYWJsZW1lbnQtU2NyaXB0LUUyRS1HaXRodWItUHJvdmlkZXItUm9sZScsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGRldmVsb3BlcnMgdG8gYWNjZXNzIHRoZSBFS1MgY2x1c3RlciBtYW51YWxseSBvbiB0aGUgdGVybWluYWxcbiAgICAgICAgcm9sZS5hc3N1bWVSb2xlUG9saWN5Py5hZGRTdGF0ZW1lbnRzKFxuICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uczogWydzdHM6QXNzdW1lUm9sZSddLFxuICAgICAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgQWNjb3VudFJvb3RQcmluY2lwYWwoKV0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gRUtTIGNsdXN0ZXIgd2l0aCBhIGxvYWQgYmFsYW5jZXIgdGhhdCB3aWxsIHJ1biB0aGUgRTJFIHRlc3RzXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgQ2x1c3Rlcih0aGlzLCBgZTJlLWVuYWJsZW1lbnQtc2NyaXB0LXRlc3RgLCB7XG4gICAgICAgICAgICB2ZXJzaW9uOiBLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNyxcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBgZTJlLWVuYWJsZW1lbnQtc2NyaXB0LXRlc3RgLFxuICAgICAgICAgICAgYWxiQ29udHJvbGxlcjogeyB2ZXJzaW9uOiBBbGJDb250cm9sbGVyVmVyc2lvbi5WMl80XzcgfSxcbiAgICAgICAgICAgIG1hc3RlcnNSb2xlOiByb2xlLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgQ2ZuSWRlbnRpdHlQcm92aWRlckNvbmZpZyh0aGlzLCBgYWRvdC1vaWRjLXByb3ZpZGVyLWNvbmZpZ3VyYXRpb25gLCB7XG4gICAgICAgICAgICBjbHVzdGVyTmFtZTogY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgICAgICAgIHR5cGU6ICdvaWRjJyxcbiAgICAgICAgICAgIG9pZGM6IHtcbiAgICAgICAgICAgICAgICBjbGllbnRJZDogJ3N0cy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgICAgICAgICBpc3N1ZXJVcmw6ICdodHRwczovL3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJkc1NlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCAnUmRzU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgICAgICAgIHZwYzogY2x1c3Rlci52cGMsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBSRFMgQXVyb3JhIGNsdXN0ZXInLFxuICAgICAgICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGluZ3Jlc3MgcnVsZSB0byBhbGxvdyBhY2Nlc3MgZnJvbSBhbGwgSVB2NCBhZGRyZXNzZXNcbiAgICAgICAgcmRzU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShQZWVyLmFueUlwdjQoKSwgUG9ydC50Y3AoMzMwNiksICdBbGxvdyBNeVNRTCBhY2Nlc3MgZnJvbSBhbGwgSVB2NCcpO1xuXG4gICAgICAgIGNvbnN0IHJkc0NsdXN0ZXIgPSBuZXcgRGF0YWJhc2VDbHVzdGVyKHRoaXMsICdSZHNBdXJvcmFFbmFibGVtZW50U2NyaXB0UHl0aG9uRTJFQ2x1c3RlckZvck15U1FMJywge1xuICAgICAgICAgICAgZW5naW5lOiBEYXRhYmFzZUNsdXN0ZXJFbmdpbmUuYXVyb3JhTXlzcWwoeyB2ZXJzaW9uOiBBdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24uVkVSXzNfMDRfMSB9KSxcbiAgICAgICAgICAgIGNsdXN0ZXJJZGVudGlmaWVyOiAnUmRzQXVyb3JhRW5hYmxlbWVudFNjcmlwdFB5dGhvbkUyRUNsdXN0ZXJGb3JNeVNRTCcsXG4gICAgICAgICAgICBzdG9yYWdlVHlwZTogREJDbHVzdGVyU3RvcmFnZVR5cGUuQVVST1JBLFxuICAgICAgICAgICAgdnBjOiBjbHVzdGVyLnZwYyxcbiAgICAgICAgICAgIHdyaXRlcjogQ2x1c3Rlckluc3RhbmNlLnByb3Zpc2lvbmVkKCd3cml0ZXInKSxcbiAgICAgICAgICAgIHJlYWRlcnM6IFtDbHVzdGVySW5zdGFuY2UucHJvdmlzaW9uZWQoJ3JlYWRlcicpXSxcbiAgICAgICAgICAgIGRlbGV0aW9uUHJvdGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIHN0b3JhZ2VFbmNyeXB0ZWQ6IHRydWUsXG4gICAgICAgICAgICBzZWN1cml0eUdyb3VwczogW3Jkc1NlY3VyaXR5R3JvdXBdLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByZHNDbHVzdGVyTDFDb25zdHJ1Y3QgPSByZHNDbHVzdGVyLm5vZGUuZGVmYXVsdENoaWxkIGFzIENmbkRCQ2x1c3RlcjtcbiAgICAgICAgcmRzQ2x1c3RlckwxQ29uc3RydWN0LmFkZFByb3BlcnR5T3ZlcnJpZGUoJ01hbmFnZU1hc3RlclVzZXJQYXNzd29yZCcsIHRydWUpO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlPdmVycmlkZSgnTWFzdGVyVXNlcm5hbWUnLCAnYWRtaW4nKTtcbiAgICAgICAgcmRzQ2x1c3RlckwxQ29uc3RydWN0LmFkZFByb3BlcnR5RGVsZXRpb25PdmVycmlkZSgnTWFzdGVyVXNlclBhc3N3b3JkJyk7XG4gICAgfVxufVxuIl19