"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdStorageStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const ecr_1 = require("../constructs/ecr");
const constants_1 = require("../utils/constants");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
/* Stack for creating Prod storage resources used for Pulse artifacts */
class ProdStorageStack extends pipelines_1.DeploymentStack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const prodReleaseRoles = [aws_iam_1.Role.fromRoleName(this, 'prod-workflow-role', constants_1.GH_WORKFLOW_PROD_ROLE)];
        /* Policy necessary for ARS to be able to copy images published in a specific repository */
        const arsPolicyForSourceEcr = new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            principals: [new aws_iam_1.ServicePrincipal('ars.eks-dataplane.aws.internal')],
            actions: [
                'ecr:BatchCheckLayerAvailability',
                'ecr:BatchGetImage',
                'ecr:DescribeImages',
                'ecr:GetAuthorizationToken',
                'ecr:GetDownloadUrlForLayer',
                'ecr:ListImages',
            ],
        });
        /* Private ECR source repository for ARS for ADOT Python */
        new ecr_1.ECRRepo(this, 'AdotPythonArsSourceEcr', {
            name: constants_1.ECR_ADOT_PYTHON_ARS_SOURCE,
            pullAccounts: [],
            pushPullRoles: prodReleaseRoles,
            policy: arsPolicyForSourceEcr,
        });
    }
}
exports.ProdStorageStack = ProdStorageStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZF9zdG9yYWdlX3N0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0YWNrcy9wcm9kX3N0b3JhZ2Vfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0NBQXdFO0FBR3hFLDJDQUE0QztBQUM1QyxrREFBdUY7QUFDdkYsaURBQXNGO0FBTXRGLHdFQUF3RTtBQUN4RSxNQUFhLGdCQUFpQixTQUFRLDJCQUFlO0lBQ2pELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEI7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGNBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLGlDQUFxQixDQUFDLENBQUMsQ0FBQztRQUVoRywyRkFBMkY7UUFDM0YsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLHlCQUFlLENBQUM7WUFDOUMsTUFBTSxFQUFFLGdCQUFNLENBQUMsS0FBSztZQUNwQixVQUFVLEVBQUUsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLGdDQUFnQyxDQUFDLENBQUM7WUFDcEUsT0FBTyxFQUFFO2dCQUNMLGlDQUFpQztnQkFDakMsbUJBQW1CO2dCQUNuQixvQkFBb0I7Z0JBQ3BCLDJCQUEyQjtnQkFDM0IsNEJBQTRCO2dCQUM1QixnQkFBZ0I7YUFDbkI7U0FDSixDQUFDLENBQUM7UUFFSCwyREFBMkQ7UUFDM0QsSUFBSSxhQUFPLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ3hDLElBQUksRUFBRSxzQ0FBMEI7WUFDaEMsWUFBWSxFQUFFLEVBQUU7WUFDaEIsYUFBYSxFQUFFLGdCQUFnQjtZQUMvQixNQUFNLEVBQUUscUJBQXFCO1NBQ2hDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTNCRCw0Q0EyQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZXBsb3ltZW50U3RhY2ssIERlcGxveW1lbnRTdGFja1Byb3BzIH0gZnJvbSAnQGFtem4vcGlwZWxpbmVzJztcblxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBFQ1JSZXBvIH0gZnJvbSAnLi4vY29uc3RydWN0cy9lY3InO1xuaW1wb3J0IHsgRUNSX0FET1RfUFlUSE9OX0FSU19TT1VSQ0UsIEdIX1dPUktGTE9XX1BST0RfUk9MRSB9IGZyb20gJy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBFZmZlY3QsIFBvbGljeVN0YXRlbWVudCwgUm9sZSwgU2VydmljZVByaW5jaXBhbCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuXG5pbnRlcmZhY2UgUHJvZFN0b3JhZ2VTdGFja1Byb3BzIGV4dGVuZHMgRGVwbG95bWVudFN0YWNrUHJvcHMge1xuICAgIHByb2RBY2NvdW50czogc3RyaW5nW107XG59XG5cbi8qIFN0YWNrIGZvciBjcmVhdGluZyBQcm9kIHN0b3JhZ2UgcmVzb3VyY2VzIHVzZWQgZm9yIFB1bHNlIGFydGlmYWN0cyAqL1xuZXhwb3J0IGNsYXNzIFByb2RTdG9yYWdlU3RhY2sgZXh0ZW5kcyBEZXBsb3ltZW50U3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBQcm9kU3RvcmFnZVN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG4gICAgICAgIGNvbnN0IHByb2RSZWxlYXNlUm9sZXMgPSBbUm9sZS5mcm9tUm9sZU5hbWUodGhpcywgJ3Byb2Qtd29ya2Zsb3ctcm9sZScsIEdIX1dPUktGTE9XX1BST0RfUk9MRSldO1xuXG4gICAgICAgIC8qIFBvbGljeSBuZWNlc3NhcnkgZm9yIEFSUyB0byBiZSBhYmxlIHRvIGNvcHkgaW1hZ2VzIHB1Ymxpc2hlZCBpbiBhIHNwZWNpZmljIHJlcG9zaXRvcnkgKi9cbiAgICAgICAgY29uc3QgYXJzUG9saWN5Rm9yU291cmNlRWNyID0gbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgU2VydmljZVByaW5jaXBhbCgnYXJzLmVrcy1kYXRhcGxhbmUuYXdzLmludGVybmFsJyldLFxuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICdlY3I6QmF0Y2hDaGVja0xheWVyQXZhaWxhYmlsaXR5JyxcbiAgICAgICAgICAgICAgICAnZWNyOkJhdGNoR2V0SW1hZ2UnLFxuICAgICAgICAgICAgICAgICdlY3I6RGVzY3JpYmVJbWFnZXMnLFxuICAgICAgICAgICAgICAgICdlY3I6R2V0QXV0aG9yaXphdGlvblRva2VuJyxcbiAgICAgICAgICAgICAgICAnZWNyOkdldERvd25sb2FkVXJsRm9yTGF5ZXInLFxuICAgICAgICAgICAgICAgICdlY3I6TGlzdEltYWdlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcblxuICAgICAgICAvKiBQcml2YXRlIEVDUiBzb3VyY2UgcmVwb3NpdG9yeSBmb3IgQVJTIGZvciBBRE9UIFB5dGhvbiAqL1xuICAgICAgICBuZXcgRUNSUmVwbyh0aGlzLCAnQWRvdFB5dGhvbkFyc1NvdXJjZUVjcicsIHtcbiAgICAgICAgICAgIG5hbWU6IEVDUl9BRE9UX1BZVEhPTl9BUlNfU09VUkNFLFxuICAgICAgICAgICAgcHVsbEFjY291bnRzOiBbXSxcbiAgICAgICAgICAgIHB1c2hQdWxsUm9sZXM6IHByb2RSZWxlYXNlUm9sZXMsXG4gICAgICAgICAgICBwb2xpY3k6IGFyc1BvbGljeUZvclNvdXJjZUVjcixcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19