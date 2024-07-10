"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EKSCluster = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const lambda_layer_kubectl_v27_1 = require("@aws-cdk/lambda-layer-kubectl-v27");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const constants_1 = require("../utils/constants");
class EKSCluster extends aws_eks_1.Cluster {
    constructor(scope, clusterName, region, role) {
        let EKSClusterProps;
        if (region == 'us-west-1') {
            EKSClusterProps = {
                version: aws_eks_1.KubernetesVersion.V1_27,
                clusterName: clusterName,
                albController: { version: aws_eks_1.AlbControllerVersion.V2_4_7 },
                mastersRole: role,
                kubectlLayer: new lambda_layer_kubectl_v27_1.KubectlV27Layer(scope, 'kubectl'),
                vpc: new aws_ec2_1.Vpc(scope, `${clusterName}-vpc`, {
                    cidr: '10.0.0.0/16',
                    enableDnsHostnames: true,
                    enableDnsSupport: true,
                    defaultInstanceTenancy: aws_ec2_1.DefaultInstanceTenancy.DEFAULT,
                    availabilityZones: constants_1.sfoAvailabilityZones,
                }),
            };
        }
        else {
            EKSClusterProps = {
                version: aws_eks_1.KubernetesVersion.V1_27,
                clusterName: clusterName,
                albController: { version: aws_eks_1.AlbControllerVersion.V2_4_7 },
                mastersRole: role,
            };
        }
        super(scope, clusterName, EKSClusterProps);
    }
}
exports.EKSCluster = EKSCluster;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzLWNsdXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvY29uc3RydWN0cy9la3MtY2x1c3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBdUY7QUFHdkYsZ0ZBQW9FO0FBQ3BFLGlEQUFrRTtBQUNsRSxrREFBMEQ7QUFDMUQsTUFBYSxVQUFXLFNBQVEsaUJBQU87SUFDbkMsWUFBWSxLQUFnQixFQUFFLFdBQW1CLEVBQUUsTUFBYyxFQUFFLElBQVc7UUFDMUUsSUFBSSxlQUFlLENBQUM7UUFDcEIsSUFBSSxNQUFNLElBQUksV0FBVyxFQUFFO1lBQ3ZCLGVBQWUsR0FBRztnQkFDZCxPQUFPLEVBQUUsMkJBQWlCLENBQUMsS0FBSztnQkFDaEMsV0FBVyxFQUFFLFdBQVc7Z0JBQ3hCLGFBQWEsRUFBRSxFQUFFLE9BQU8sRUFBRSw4QkFBb0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZELFdBQVcsRUFBRSxJQUFJO2dCQUNqQixZQUFZLEVBQUUsSUFBSSwwQ0FBZSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUM7Z0JBQ25ELEdBQUcsRUFBRSxJQUFJLGFBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxXQUFXLE1BQU0sRUFBRTtvQkFDdEMsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLGtCQUFrQixFQUFFLElBQUk7b0JBQ3hCLGdCQUFnQixFQUFFLElBQUk7b0JBQ3RCLHNCQUFzQixFQUFFLGdDQUFzQixDQUFDLE9BQU87b0JBQ3RELGlCQUFpQixFQUFFLGdDQUFvQjtpQkFDMUMsQ0FBQzthQUNMLENBQUM7U0FDTDthQUFNO1lBQ0gsZUFBZSxHQUFHO2dCQUNkLE9BQU8sRUFBRSwyQkFBaUIsQ0FBQyxLQUFLO2dCQUNoQyxXQUFXLEVBQUUsV0FBVztnQkFDeEIsYUFBYSxFQUFFLEVBQUUsT0FBTyxFQUFFLDhCQUFvQixDQUFDLE1BQU0sRUFBRTtnQkFDdkQsV0FBVyxFQUFFLElBQUk7YUFDcEIsQ0FBQztTQUNMO1FBQ0QsS0FBSyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDL0MsQ0FBQztDQUNKO0FBNUJELGdDQTRCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFsYkNvbnRyb2xsZXJWZXJzaW9uLCBDbHVzdGVyLCBLdWJlcm5ldGVzVmVyc2lvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0IHsgSVJvbGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgS3ViZWN0bFYyN0xheWVyIH0gZnJvbSAnQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjI3JztcbmltcG9ydCB7IERlZmF1bHRJbnN0YW5jZVRlbmFuY3ksIFZwYyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgc2ZvQXZhaWxhYmlsaXR5Wm9uZXMgfSBmcm9tICcuLi91dGlscy9jb25zdGFudHMnO1xuZXhwb3J0IGNsYXNzIEVLU0NsdXN0ZXIgZXh0ZW5kcyBDbHVzdGVyIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBjbHVzdGVyTmFtZTogc3RyaW5nLCByZWdpb246IHN0cmluZywgcm9sZTogSVJvbGUpIHtcbiAgICAgICAgbGV0IEVLU0NsdXN0ZXJQcm9wcztcbiAgICAgICAgaWYgKHJlZ2lvbiA9PSAndXMtd2VzdC0xJykge1xuICAgICAgICAgICAgRUtTQ2x1c3RlclByb3BzID0ge1xuICAgICAgICAgICAgICAgIHZlcnNpb246IEt1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LFxuICAgICAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBjbHVzdGVyTmFtZSxcbiAgICAgICAgICAgICAgICBhbGJDb250cm9sbGVyOiB7IHZlcnNpb246IEFsYkNvbnRyb2xsZXJWZXJzaW9uLlYyXzRfNyB9LFxuICAgICAgICAgICAgICAgIG1hc3RlcnNSb2xlOiByb2xlLFxuICAgICAgICAgICAgICAgIGt1YmVjdGxMYXllcjogbmV3IEt1YmVjdGxWMjdMYXllcihzY29wZSwgJ2t1YmVjdGwnKSxcbiAgICAgICAgICAgICAgICB2cGM6IG5ldyBWcGMoc2NvcGUsIGAke2NsdXN0ZXJOYW1lfS12cGNgLCB7XG4gICAgICAgICAgICAgICAgICAgIGNpZHI6ICcxMC4wLjAuMC8xNicsXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZURuc0hvc3RuYW1lczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlRG5zU3VwcG9ydDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdEluc3RhbmNlVGVuYW5jeTogRGVmYXVsdEluc3RhbmNlVGVuYW5jeS5ERUZBVUxULFxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lczogc2ZvQXZhaWxhYmlsaXR5Wm9uZXMsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgRUtTQ2x1c3RlclByb3BzID0ge1xuICAgICAgICAgICAgICAgIHZlcnNpb246IEt1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LFxuICAgICAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBjbHVzdGVyTmFtZSxcbiAgICAgICAgICAgICAgICBhbGJDb250cm9sbGVyOiB7IHZlcnNpb246IEFsYkNvbnRyb2xsZXJWZXJzaW9uLlYyXzRfNyB9LFxuICAgICAgICAgICAgICAgIG1hc3RlcnNSb2xlOiByb2xlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcihzY29wZSwgY2x1c3Rlck5hbWUsIEVLU0NsdXN0ZXJQcm9wcyk7XG4gICAgfVxufVxuIl19