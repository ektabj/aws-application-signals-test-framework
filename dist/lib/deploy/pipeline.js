"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APMPulseEnablementTestInfraPipeline = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const config_1 = require("../utils/config");
const constants_1 = require("../utils/constants");
const appStacks_1 = require("./appStacks");
const cdk_isengard_1 = require("@amzn/cdk-isengard");
const common_1 = require("../utils/common");
const staging_storage_stack_1 = require("../stacks/staging_storage_stack");
const otel_python_workflow_stack_1 = require("../stacks/otel_python_workflow_stack");
const prod_storage_stack_1 = require("../stacks/prod_storage_stack");
class APMPulseEnablementTestInfraPipeline extends pipelines_1.DeploymentPipeline {
    constructor(app, props) {
        super(app, 'Pipeline', props);
        this.accountIds = [];
        // Set up CodeReviewVerification and remove manual approvals
        this.versionSetStage
            .addApprovalWorkflow('Code Review Verification')
            .addStep(new pipelines_1.CodeReviewVerificationApprovalWorkflowStep());
        this.packagingStage
            .addApprovalWorkflow('Approval Workflow')
            .addStep(new pipelines_1.BakeTimeApprovalWorkflowStep({ name: 'Bake Time', duration: 0 }));
        // Stage for testing resources. Includes Gamma Accounts for E2E testing as well as staging artifacts for Otel Python
        this.addTestingStage(this);
        // Resources needed by workflows in https://github.com/aws-observability/aws-otel-python-instrumentation/tree/main/.github/workflows
        // are located in this account: 637423224110. This account was created separately from the E2E testing resources pipeline, but we decided to merge them together
        // with this SIM: https://sim.amazon.com/issues/apm-pulse-2301. Rather than moving all the resources in this account to an account in the APMPulseENablementTestInfraCDK
        // pipeline, we decided to move the account altogether and add it to this pipeline instead.
        this.addOTELPythonResourceStage(this);
        this.getStages().forEach((stage) => this.bootstrapStage(stage, this));
    }
    getStages() {
        return config_1.pipelineStages;
    }
    getAccountLookupStack(pipeline, stageName, region) {
        return new aws_cdk_lib_1.Stack(pipeline.scope, `AccountLookupStack-${stageName}-${region}`, {
            env: {
                account: `account-${stageName}-${region}`,
                region: `account-region-${region}`,
            },
        });
    }
    bootstrapStage(stage, pipeline) {
        const { regions, stageName, wave } = stage;
        // We will use fullStageName for pipeline stage label and deployment group prefix
        let fullStageName = stageName.valueOf();
        if (stageName === constants_1.Stage.Prod) {
            fullStageName = `${stageName}-wave-${wave}`;
        }
        const deploymentGroupStage = pipeline.addStage(fullStageName, { isProd: stageName === constants_1.Stage.Prod });
        const approvalWorkflow = deploymentGroupStage.addApprovalWorkflow(`${fullStageName} Approvals`, {
            rollbackOnFailure: stageName === constants_1.Stage.Prod,
        });
        if (stageName === constants_1.Stage.Prod && wave == 1) {
            approvalWorkflow.addStep(new pipelines_1.BakeTimeApprovalWorkflowStep({
                name: `Bake Time - 120 min`,
                duration: 120,
            }));
        }
        else if (stageName !== constants_1.Stage.Gamma) {
            approvalWorkflow.addStep(new pipelines_1.BakeTimeApprovalWorkflowStep({
                name: `No Op Approval - ${fullStageName}`,
                duration: 0,
            }));
        }
        regions.forEach((region) => {
            const accountId = cdk_isengard_1.IsengardAccount.lookupAccountFromEmail(this.getAccountLookupStack(pipeline, stageName, region), {
                email: `${(0, common_1.getAccountName)(stageName, region)}@amazon.com`,
            }).awsAccountId;
            this.accountIds.push({ region: accountId });
            const deploymentGroupTarget = deploymentGroupStage.addDeploymentGroup({
                name: `${fullStageName}-${region}`,
            });
            const deploymentEnvironment = pipeline.deploymentEnvironmentFor(accountId, region);
            const stacks = (0, appStacks_1.addAppStacks)(pipeline.scope, {
                env: deploymentEnvironment,
                stage: stageName.valueOf().toLowerCase(),
            });
            const filteredStacks = Object.values(stacks).filter((stack) => stack != null);
            deploymentGroupTarget.addStacks(...filteredStacks);
        });
    }
    addTestingStage(pipeline) {
        const stageName = constants_1.Stage.Gamma;
        const otelPythonRegion = constants_1.ADOT_PYTHON_REGION;
        const otelPythonDeploymentName = `${constants_1.ADOT_PYTHON_NAME}`;
        const otelPythonAccountId = constants_1.ADOT_PYTHON_ACCOUNT_ID;
        const e2eRegion = 'ap-southeast-3';
        const e2eDeploymentName = 'e2e';
        const e2eAccountId = cdk_isengard_1.IsengardAccount.lookupAccountFromEmail(this.getAccountLookupStack(pipeline, stageName, e2eRegion), {
            email: `${(0, common_1.getAccountName)(stageName, e2eRegion)}@amazon.com`,
        }).awsAccountId;
        const deploymentGroupStage = pipeline.addStage(stageName, { isProd: false });
        const approvalWorkflow = deploymentGroupStage.addApprovalWorkflow(`${stageName} Approvals`);
        approvalWorkflow.addStep(new pipelines_1.BakeTimeApprovalWorkflowStep({
            name: `Bake Time - 120 min`,
            duration: 120,
        }));
        // Deployment group for E2E Testing Gamma Stage Stacks
        const e2eDeploymentGroupTarget = deploymentGroupStage.addDeploymentGroup({
            name: `${stageName}-${e2eDeploymentName}-${e2eRegion}`,
        });
        const e2eDeploymentEnvironment = pipeline.deploymentEnvironmentFor(e2eAccountId, e2eRegion);
        const stacks = (0, appStacks_1.addAppStacks)(pipeline.scope, {
            env: e2eDeploymentEnvironment,
            stage: stageName.valueOf().toLowerCase(),
        });
        const filteredStacks = Object.values(stacks).filter((stack) => stack != null);
        e2eDeploymentGroupTarget.addStacks(...filteredStacks);
        // Deployment group for Otel Python Staging Resources
        const otelPythonDeploymentGroupTarget = deploymentGroupStage.addDeploymentGroup({
            name: `${stageName}-${otelPythonDeploymentName}-${otelPythonRegion}`,
        });
        const otelPythonDeploymentEnvironment = pipeline.deploymentEnvironmentFor(otelPythonAccountId, otelPythonRegion);
        const deploymentProps = {
            env: otelPythonDeploymentEnvironment,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
            stage: 'testing',
        };
        const stagingStorageStack = new staging_storage_stack_1.StagingStorageStack(pipeline.scope, 'StagingStorageStack', {
            ...deploymentProps,
            betaAccounts: [],
            stagingAccounts: [],
        });
        const workflowStack = new otel_python_workflow_stack_1.OtelPythonWorkflowsStack(pipeline.scope, 'OtelPythonWorkflowsStack', {
            ...deploymentProps,
        });
        otelPythonDeploymentGroupTarget.addStacks(stagingStorageStack);
        otelPythonDeploymentGroupTarget.addStacks(workflowStack);
    }
    addOTELPythonResourceStage(pipeline) {
        const region = constants_1.ADOT_PYTHON_REGION;
        const stageName = `${constants_1.Stage.Prod}-${constants_1.ADOT_PYTHON_NAME}`;
        const accountId = constants_1.ADOT_PYTHON_ACCOUNT_ID;
        const deploymentGroupStage = pipeline.addStage(stageName, { isProd: true });
        const approvalWorkflow = deploymentGroupStage.addApprovalWorkflow(`${stageName} Approvals`, {
            rollbackOnFailure: true,
        });
        approvalWorkflow.addStep(new pipelines_1.BakeTimeApprovalWorkflowStep({
            name: `Bake Time - 120 min`,
            duration: 120,
        }));
        const deploymentGroupTarget = deploymentGroupStage.addDeploymentGroup({
            name: `${stageName}-${region}`,
        });
        const deploymentEnvironment = pipeline.deploymentEnvironmentFor(accountId, region);
        const deploymentProps = {
            env: deploymentEnvironment,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
            stage: 'prod',
        };
        const prodStorageStack = new prod_storage_stack_1.ProdStorageStack(pipeline.scope, 'ProdStorageStack', {
            ...deploymentProps,
            prodAccounts: [],
        });
        deploymentGroupTarget.addStacks(prodStorageStack);
    }
}
exports.APMPulseEnablementTestInfraPipeline = APMPulseEnablementTestInfraPipeline;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvZGVwbG95L3BpcGVsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQU15QjtBQUN6Qiw2Q0FBeUM7QUFDekMsNENBQWdFO0FBQ2hFLGtEQUF5RztBQUN6RywyQ0FBMkM7QUFDM0MscURBQXFEO0FBQ3JELDRDQUFpRDtBQUNqRCwyRUFBc0U7QUFDdEUscUZBQWdGO0FBQ2hGLHFFQUFnRTtBQUVoRSxNQUFhLG1DQUFvQyxTQUFRLDhCQUFrQjtJQUV2RSxZQUFZLEdBQVEsRUFBRSxLQUE4QjtRQUNoRCxLQUFLLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUZsQyxlQUFVLEdBQTZCLEVBQUUsQ0FBQztRQUd0Qyw0REFBNEQ7UUFDNUQsSUFBSSxDQUFDLGVBQWU7YUFDZixtQkFBbUIsQ0FBQywwQkFBMEIsQ0FBQzthQUMvQyxPQUFPLENBQUMsSUFBSSxzREFBMEMsRUFBRSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLGNBQWM7YUFDZCxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQzthQUN4QyxPQUFPLENBQUMsSUFBSSx3Q0FBNEIsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuRixvSEFBb0g7UUFDcEgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixvSUFBb0k7UUFDcEksZ0tBQWdLO1FBQ2hLLHdLQUF3SztRQUN4SywyRkFBMkY7UUFDM0YsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7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WSxFQUFFLHdCQUFZLENBQUMsY0FBYztZQUN6QyxLQUFLLEVBQUUsTUFBTTtTQUNoQixDQUFDO1FBRUYsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHFDQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUU7WUFDOUUsR0FBRyxlQUFlO1lBQ2xCLFlBQVksRUFBRSxFQUFFO1NBQ25CLENBQUMsQ0FBQztRQUVILHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FDSjtBQXJMRCxrRkFxTEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEJha2VUaW1lQXBwcm92YWxXb3JrZmxvd1N0ZXAsXG4gICAgQ29kZVJldmlld1ZlcmlmaWNhdGlvbkFwcHJvdmFsV29ya2Zsb3dTdGVwLFxuICAgIERlcGxveW1lbnRQaXBlbGluZSxcbiAgICBEZXBsb3ltZW50UGlwZWxpbmVQcm9wcyxcbiAgICBTb2Z0d2FyZVR5cGUsXG59IGZyb20gJ0BhbXpuL3BpcGVsaW5lcyc7XG5pbXBvcnQgeyBBcHAsIFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgUGlwZWxpbmVTdGFnZSwgcGlwZWxpbmVTdGFnZXMgfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHsgU3RhZ2UsIEFET1RfUFlUSE9OX0FDQ09VTlRfSUQsIEFET1RfUFlUSE9OX1JFR0lPTiwgQURPVF9QWVRIT05fTkFNRSB9IGZyb20gJy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBhZGRBcHBTdGFja3MgfSBmcm9tICcuL2FwcFN0YWNrcyc7XG5pbXBvcnQgeyBJc2VuZ2FyZEFjY291bnQgfSBmcm9tICdAYW16bi9jZGstaXNlbmdhcmQnO1xuaW1wb3J0IHsgZ2V0QWNjb3VudE5hbWUgfSBmcm9tICcuLi91dGlscy9jb21tb24nO1xuaW1wb3J0IHsgU3RhZ2luZ1N0b3JhZ2VTdGFjayB9IGZyb20gJy4uL3N0YWNrcy9zdGFnaW5nX3N0b3JhZ2Vfc3RhY2snO1xuaW1wb3J0IHsgT3RlbFB5dGhvbldvcmtmbG93c1N0YWNrIH0gZnJvbSAnLi4vc3RhY2tzL290ZWxfcHl0aG9uX3dvcmtmbG93X3N0YWNrJztcbmltcG9ydCB7IFByb2RTdG9yYWdlU3RhY2sgfSBmcm9tICcuLi9zdGFja3MvcHJvZF9zdG9yYWdlX3N0YWNrJztcblxuZXhwb3J0IGNsYXNzIEFQTVB1bHNlRW5hYmxlbWVudFRlc3RJbmZyYVBpcGVsaW5lIGV4dGVuZHMgRGVwbG95bWVudFBpcGVsaW5lIHtcbiAgICBhY2NvdW50SWRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+W10gPSBbXTtcbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJvcHM6IERlcGxveW1lbnRQaXBlbGluZVByb3BzKSB7XG4gICAgICAgIHN1cGVyKGFwcCwgJ1BpcGVsaW5lJywgcHJvcHMpO1xuICAgICAgICAvLyBTZXQgdXAgQ29kZVJldmlld1ZlcmlmaWNhdGlvbiBhbmQgcmVtb3ZlIG1hbnVhbCBhcHByb3ZhbHNcbiAgICAgICAgdGhpcy52ZXJzaW9uU2V0U3RhZ2VcbiAgICAgICAgICAgIC5hZGRBcHByb3ZhbFdvcmtmbG93KCdDb2RlIFJldmlldyBWZXJpZmljYXRpb24nKVxuICAgICAgICAgICAgLmFkZFN0ZXAobmV3IENvZGVSZXZpZXdWZXJpZmljYXRpb25BcHByb3ZhbFdvcmtmbG93U3RlcCgpKTtcbiAgICAgICAgdGhpcy5wYWNrYWdpbmdTdGFnZVxuICAgICAgICAgICAgLmFkZEFwcHJvdmFsV29ya2Zsb3coJ0FwcHJvdmFsIFdvcmtmbG93JylcbiAgICAgICAgICAgIC5hZGRTdGVwKG5ldyBCYWtlVGltZUFwcHJvdmFsV29ya2Zsb3dTdGVwKHsgbmFtZTogJ0Jha2UgVGltZScsIGR1cmF0aW9uOiAwIH0pKTtcbiAgICAgICAgLy8gU3RhZ2UgZm9yIHRlc3RpbmcgcmVzb3VyY2VzLiBJbmNsdWRlcyBHYW1tYSBBY2NvdW50cyBmb3IgRTJFIHRlc3RpbmcgYXMgd2VsbCBhcyBzdGFnaW5nIGFydGlmYWN0cyBmb3IgT3RlbCBQeXRob25cbiAgICAgICAgdGhpcy5hZGRUZXN0aW5nU3RhZ2UodGhpcyk7XG4gICAgICAgIC8vIFJlc291cmNlcyBuZWVkZWQgYnkgd29ya2Zsb3dzIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9hd3Mtb2JzZXJ2YWJpbGl0eS9hd3Mtb3RlbC1weXRob24taW5zdHJ1bWVudGF0aW9uL3RyZWUvbWFpbi8uZ2l0aHViL3dvcmtmbG93c1xuICAgICAgICAvLyBhcmUgbG9jYXRlZCBpbiB0aGlzIGFjY291bnQ6IDYzNzQyMzIyNDExMC4gVGhpcyBhY2NvdW50IHdhcyBjcmVhdGVkIHNlcGFyYXRlbHkgZnJvbSB0aGUgRTJFIHRlc3RpbmcgcmVzb3VyY2VzIHBpcGVsaW5lLCBidXQgd2UgZGVjaWRlZCB0byBtZXJnZSB0aGVtIHRvZ2V0aGVyXG4gICAgICAgIC8vIHdpdGggdGhpcyBTSU06IGh0dHBzOi8vc2ltLmFtYXpvbi5jb20vaXNzdWVzL2FwbS1wdWxzZS0yMzAxLiBSYXRoZXIgdGhhbiBtb3ZpbmcgYWxsIHRoZSByZXNvdXJjZXMgaW4gdGhpcyBhY2NvdW50IHRvIGFuIGFjY291bnQgaW4gdGhlIEFQTVB1bHNlRU5hYmxlbWVudFRlc3RJbmZyYUNES1xuICAgICAgICAvLyBwaXBlbGluZSwgd2UgZGVjaWRlZCB0byBtb3ZlIHRoZSBhY2NvdW50IGFsdG9nZXRoZXIgYW5kIGFkZCBpdCB0byB0aGlzIHBpcGVsaW5lIGluc3RlYWQuXG4gICAgICAgIHRoaXMuYWRkT1RFTFB5dGhvblJlc291cmNlU3RhZ2UodGhpcyk7XG4gICAgICAgIHRoaXMuZ2V0U3RhZ2VzKCkuZm9yRWFjaCgoc3RhZ2UpID0+IHRoaXMuYm9vdHN0cmFwU3RhZ2Uoc3RhZ2UsIHRoaXMpKTtcbiAgICB9XG5cbiAgICBnZXRTdGFnZXMoKTogUGlwZWxpbmVTdGFnZVtdIHtcbiAgICAgICAgcmV0dXJuIHBpcGVsaW5lU3RhZ2VzO1xuICAgIH1cblxuICAgIGdldEFjY291bnRMb29rdXBTdGFjayhwaXBlbGluZTogQVBNUHVsc2VFbmFibGVtZW50VGVzdEluZnJhUGlwZWxpbmUsIHN0YWdlTmFtZTogU3RhZ2UsIHJlZ2lvbjogc3RyaW5nKTogU3RhY2sge1xuICAgICAgICByZXR1cm4gbmV3IFN0YWNrKHBpcGVsaW5lLnNjb3BlLCBgQWNjb3VudExvb2t1cFN0YWNrLSR7c3RhZ2VOYW1lfS0ke3JlZ2lvbn1gLCB7XG4gICAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgICAgICBhY2NvdW50OiBgYWNjb3VudC0ke3N0YWdlTmFtZX0tJHtyZWdpb259YCxcbiAgICAgICAgICAgICAgICByZWdpb246IGBhY2NvdW50LXJlZ2lvbi0ke3JlZ2lvbn1gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYm9vdHN0cmFwU3RhZ2Uoc3RhZ2U6IFBpcGVsaW5lU3RhZ2UsIHBpcGVsaW5lOiBBUE1QdWxzZUVuYWJsZW1lbnRUZXN0SW5mcmFQaXBlbGluZSk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IHJlZ2lvbnMsIHN0YWdlTmFtZSwgd2F2ZSB9ID0gc3RhZ2U7XG5cbiAgICAgICAgLy8gV2Ugd2lsbCB1c2UgZnVsbFN0YWdlTmFtZSBmb3IgcGlwZWxpbmUgc3RhZ2UgbGFiZWwgYW5kIGRlcGxveW1lbnQgZ3JvdXAgcHJlZml4XG4gICAgICAgIGxldCBmdWxsU3RhZ2VOYW1lID0gc3RhZ2VOYW1lLnZhbHVlT2YoKTtcblxuICAgICAgICBpZiAoc3RhZ2VOYW1lID09PSBTdGFnZS5Qcm9kKSB7XG4gICAgICAgICAgICBmdWxsU3RhZ2VOYW1lID0gYCR7c3RhZ2VOYW1lfS13YXZlLSR7d2F2ZX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVwbG95bWVudEdyb3VwU3RhZ2UgPSBwaXBlbGluZS5hZGRTdGFnZShmdWxsU3RhZ2VOYW1lLCB7IGlzUHJvZDogc3RhZ2VOYW1lID09PSBTdGFnZS5Qcm9kIH0pO1xuICAgICAgICBjb25zdCBhcHByb3ZhbFdvcmtmbG93ID0gZGVwbG95bWVudEdyb3VwU3RhZ2UuYWRkQXBwcm92YWxXb3JrZmxvdyhgJHtmdWxsU3RhZ2VOYW1lfSBBcHByb3ZhbHNgLCB7XG4gICAgICAgICAgICByb2xsYmFja09uRmFpbHVyZTogc3RhZ2VOYW1lID09PSBTdGFnZS5Qcm9kLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHN0YWdlTmFtZSA9PT0gU3RhZ2UuUHJvZCAmJiB3YXZlID09IDEpIHtcbiAgICAgICAgICAgIGFwcHJvdmFsV29ya2Zsb3cuYWRkU3RlcChcbiAgICAgICAgICAgICAgICBuZXcgQmFrZVRpbWVBcHByb3ZhbFdvcmtmbG93U3RlcCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGBCYWtlIFRpbWUgLSAxMjAgbWluYCxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDEyMCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhZ2VOYW1lICE9PSBTdGFnZS5HYW1tYSkge1xuICAgICAgICAgICAgYXBwcm92YWxXb3JrZmxvdy5hZGRTdGVwKFxuICAgICAgICAgICAgICAgIG5ldyBCYWtlVGltZUFwcHJvdmFsV29ya2Zsb3dTdGVwKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYE5vIE9wIEFwcHJvdmFsIC0gJHtmdWxsU3RhZ2VOYW1lfWAsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZWdpb25zLmZvckVhY2goKHJlZ2lvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWNjb3VudElkID0gSXNlbmdhcmRBY2NvdW50Lmxvb2t1cEFjY291bnRGcm9tRW1haWwoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRBY2NvdW50TG9va3VwU3RhY2socGlwZWxpbmUsIHN0YWdlTmFtZSwgcmVnaW9uKSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiBgJHtnZXRBY2NvdW50TmFtZShzdGFnZU5hbWUsIHJlZ2lvbil9QGFtYXpvbi5jb21gLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApLmF3c0FjY291bnRJZDtcblxuICAgICAgICAgICAgdGhpcy5hY2NvdW50SWRzLnB1c2goeyByZWdpb246IGFjY291bnRJZCB9KTtcblxuICAgICAgICAgICAgY29uc3QgZGVwbG95bWVudEdyb3VwVGFyZ2V0ID0gZGVwbG95bWVudEdyb3VwU3RhZ2UuYWRkRGVwbG95bWVudEdyb3VwKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBgJHtmdWxsU3RhZ2VOYW1lfS0ke3JlZ2lvbn1gLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRlcGxveW1lbnRFbnZpcm9ubWVudCA9IHBpcGVsaW5lLmRlcGxveW1lbnRFbnZpcm9ubWVudEZvcihhY2NvdW50SWQsIHJlZ2lvbik7XG4gICAgICAgICAgICBjb25zdCBzdGFja3MgPSBhZGRBcHBTdGFja3MocGlwZWxpbmUuc2NvcGUsIHtcbiAgICAgICAgICAgICAgICBlbnY6IGRlcGxveW1lbnRFbnZpcm9ubWVudCxcbiAgICAgICAgICAgICAgICBzdGFnZTogc3RhZ2VOYW1lLnZhbHVlT2YoKS50b0xvd2VyQ2FzZSgpIGFzIFN0YWdlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrcyA9IE9iamVjdC52YWx1ZXMoc3RhY2tzKS5maWx0ZXIoKHN0YWNrKSA9PiBzdGFjayAhPSBudWxsKTtcblxuICAgICAgICAgICAgZGVwbG95bWVudEdyb3VwVGFyZ2V0LmFkZFN0YWNrcyguLi5maWx0ZXJlZFN0YWNrcyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZFRlc3RpbmdTdGFnZShwaXBlbGluZTogQVBNUHVsc2VFbmFibGVtZW50VGVzdEluZnJhUGlwZWxpbmUpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhZ2VOYW1lID0gU3RhZ2UuR2FtbWE7XG4gICAgICAgIGNvbnN0IG90ZWxQeXRob25SZWdpb24gPSBBRE9UX1BZVEhPTl9SRUdJT047XG4gICAgICAgIGNvbnN0IG90ZWxQeXRob25EZXBsb3ltZW50TmFtZSA9IGAke0FET1RfUFlUSE9OX05BTUV9YDtcbiAgICAgICAgY29uc3Qgb3RlbFB5dGhvbkFjY291bnRJZCA9IEFET1RfUFlUSE9OX0FDQ09VTlRfSUQ7XG4gICAgICAgIGNvbnN0IGUyZVJlZ2lvbiA9ICdhcC1zb3V0aGVhc3QtMyc7XG4gICAgICAgIGNvbnN0IGUyZURlcGxveW1lbnROYW1lID0gJ2UyZSc7XG4gICAgICAgIGNvbnN0IGUyZUFjY291bnRJZCA9IElzZW5nYXJkQWNjb3VudC5sb29rdXBBY2NvdW50RnJvbUVtYWlsKFxuICAgICAgICAgICAgdGhpcy5nZXRBY2NvdW50TG9va3VwU3RhY2socGlwZWxpbmUsIHN0YWdlTmFtZSwgZTJlUmVnaW9uKSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbWFpbDogYCR7Z2V0QWNjb3VudE5hbWUoc3RhZ2VOYW1lLCBlMmVSZWdpb24pfUBhbWF6b24uY29tYCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICkuYXdzQWNjb3VudElkO1xuXG4gICAgICAgIGNvbnN0IGRlcGxveW1lbnRHcm91cFN0YWdlID0gcGlwZWxpbmUuYWRkU3RhZ2Uoc3RhZ2VOYW1lLCB7IGlzUHJvZDogZmFsc2UgfSk7XG5cbiAgICAgICAgY29uc3QgYXBwcm92YWxXb3JrZmxvdyA9IGRlcGxveW1lbnRHcm91cFN0YWdlLmFkZEFwcHJvdmFsV29ya2Zsb3coYCR7c3RhZ2VOYW1lfSBBcHByb3ZhbHNgKTtcbiAgICAgICAgYXBwcm92YWxXb3JrZmxvdy5hZGRTdGVwKFxuICAgICAgICAgICAgbmV3IEJha2VUaW1lQXBwcm92YWxXb3JrZmxvd1N0ZXAoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGBCYWtlIFRpbWUgLSAxMjAgbWluYCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTIwLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gRGVwbG95bWVudCBncm91cCBmb3IgRTJFIFRlc3RpbmcgR2FtbWEgU3RhZ2UgU3RhY2tzXG4gICAgICAgIGNvbnN0IGUyZURlcGxveW1lbnRHcm91cFRhcmdldCA9IGRlcGxveW1lbnRHcm91cFN0YWdlLmFkZERlcGxveW1lbnRHcm91cCh7XG4gICAgICAgICAgICBuYW1lOiBgJHtzdGFnZU5hbWV9LSR7ZTJlRGVwbG95bWVudE5hbWV9LSR7ZTJlUmVnaW9ufWAsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBlMmVEZXBsb3ltZW50RW52aXJvbm1lbnQgPSBwaXBlbGluZS5kZXBsb3ltZW50RW52aXJvbm1lbnRGb3IoZTJlQWNjb3VudElkLCBlMmVSZWdpb24pO1xuICAgICAgICBjb25zdCBzdGFja3MgPSBhZGRBcHBTdGFja3MocGlwZWxpbmUuc2NvcGUsIHtcbiAgICAgICAgICAgIGVudjogZTJlRGVwbG95bWVudEVudmlyb25tZW50LFxuICAgICAgICAgICAgc3RhZ2U6IHN0YWdlTmFtZS52YWx1ZU9mKCkudG9Mb3dlckNhc2UoKSBhcyBTdGFnZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkU3RhY2tzID0gT2JqZWN0LnZhbHVlcyhzdGFja3MpLmZpbHRlcigoc3RhY2spID0+IHN0YWNrICE9IG51bGwpO1xuICAgICAgICBlMmVEZXBsb3ltZW50R3JvdXBUYXJnZXQuYWRkU3RhY2tzKC4uLmZpbHRlcmVkU3RhY2tzKTtcblxuICAgICAgICAvLyBEZXBsb3ltZW50IGdyb3VwIGZvciBPdGVsIFB5dGhvbiBTdGFnaW5nIFJlc291cmNlc1xuICAgICAgICBjb25zdCBvdGVsUHl0aG9uRGVwbG95bWVudEdyb3VwVGFyZ2V0ID0gZGVwbG95bWVudEdyb3VwU3RhZ2UuYWRkRGVwbG95bWVudEdyb3VwKHtcbiAgICAgICAgICAgIG5hbWU6IGAke3N0YWdlTmFtZX0tJHtvdGVsUHl0aG9uRGVwbG95bWVudE5hbWV9LSR7b3RlbFB5dGhvblJlZ2lvbn1gLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgb3RlbFB5dGhvbkRlcGxveW1lbnRFbnZpcm9ubWVudCA9IHBpcGVsaW5lLmRlcGxveW1lbnRFbnZpcm9ubWVudEZvcihcbiAgICAgICAgICAgIG90ZWxQeXRob25BY2NvdW50SWQsXG4gICAgICAgICAgICBvdGVsUHl0aG9uUmVnaW9uLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBkZXBsb3ltZW50UHJvcHMgPSB7XG4gICAgICAgICAgICBlbnY6IG90ZWxQeXRob25EZXBsb3ltZW50RW52aXJvbm1lbnQsXG4gICAgICAgICAgICBzb2Z0d2FyZVR5cGU6IFNvZnR3YXJlVHlwZS5JTkZSQVNUUlVDVFVSRSxcbiAgICAgICAgICAgIHN0YWdlOiAndGVzdGluZycsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0YWdpbmdTdG9yYWdlU3RhY2sgPSBuZXcgU3RhZ2luZ1N0b3JhZ2VTdGFjayhwaXBlbGluZS5zY29wZSwgJ1N0YWdpbmdTdG9yYWdlU3RhY2snLCB7XG4gICAgICAgICAgICAuLi5kZXBsb3ltZW50UHJvcHMsXG4gICAgICAgICAgICBiZXRhQWNjb3VudHM6IFtdLFxuICAgICAgICAgICAgc3RhZ2luZ0FjY291bnRzOiBbXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHdvcmtmbG93U3RhY2sgPSBuZXcgT3RlbFB5dGhvbldvcmtmbG93c1N0YWNrKHBpcGVsaW5lLnNjb3BlLCAnT3RlbFB5dGhvbldvcmtmbG93c1N0YWNrJywge1xuICAgICAgICAgICAgLi4uZGVwbG95bWVudFByb3BzLFxuICAgICAgICB9KTtcbiAgICAgICAgb3RlbFB5dGhvbkRlcGxveW1lbnRHcm91cFRhcmdldC5hZGRTdGFja3Moc3RhZ2luZ1N0b3JhZ2VTdGFjayk7XG4gICAgICAgIG90ZWxQeXRob25EZXBsb3ltZW50R3JvdXBUYXJnZXQuYWRkU3RhY2tzKHdvcmtmbG93U3RhY2spO1xuICAgIH1cblxuICAgIGFkZE9URUxQeXRob25SZXNvdXJjZVN0YWdlKHBpcGVsaW5lOiBBUE1QdWxzZUVuYWJsZW1lbnRUZXN0SW5mcmFQaXBlbGluZSk6IHZvaWQge1xuICAgICAgICBjb25zdCByZWdpb24gPSBBRE9UX1BZVEhPTl9SRUdJT047XG4gICAgICAgIGNvbnN0IHN0YWdlTmFtZSA9IGAke1N0YWdlLlByb2R9LSR7QURPVF9QWVRIT05fTkFNRX1gO1xuICAgICAgICBjb25zdCBhY2NvdW50SWQgPSBBRE9UX1BZVEhPTl9BQ0NPVU5UX0lEO1xuXG4gICAgICAgIGNvbnN0IGRlcGxveW1lbnRHcm91cFN0YWdlID0gcGlwZWxpbmUuYWRkU3RhZ2Uoc3RhZ2VOYW1lLCB7IGlzUHJvZDogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgYXBwcm92YWxXb3JrZmxvdyA9IGRlcGxveW1lbnRHcm91cFN0YWdlLmFkZEFwcHJvdmFsV29ya2Zsb3coYCR7c3RhZ2VOYW1lfSBBcHByb3ZhbHNgLCB7XG4gICAgICAgICAgICByb2xsYmFja09uRmFpbHVyZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGFwcHJvdmFsV29ya2Zsb3cuYWRkU3RlcChcbiAgICAgICAgICAgIG5ldyBCYWtlVGltZUFwcHJvdmFsV29ya2Zsb3dTdGVwKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBgQmFrZSBUaW1lIC0gMTIwIG1pbmAsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDEyMCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBkZXBsb3ltZW50R3JvdXBUYXJnZXQgPSBkZXBsb3ltZW50R3JvdXBTdGFnZS5hZGREZXBsb3ltZW50R3JvdXAoe1xuICAgICAgICAgICAgbmFtZTogYCR7c3RhZ2VOYW1lfS0ke3JlZ2lvbn1gLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZGVwbG95bWVudEVudmlyb25tZW50ID0gcGlwZWxpbmUuZGVwbG95bWVudEVudmlyb25tZW50Rm9yKGFjY291bnRJZCwgcmVnaW9uKTtcbiAgICAgICAgY29uc3QgZGVwbG95bWVudFByb3BzID0ge1xuICAgICAgICAgICAgZW52OiBkZXBsb3ltZW50RW52aXJvbm1lbnQsXG4gICAgICAgICAgICBzb2Z0d2FyZVR5cGU6IFNvZnR3YXJlVHlwZS5JTkZSQVNUUlVDVFVSRSxcbiAgICAgICAgICAgIHN0YWdlOiAncHJvZCcsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcHJvZFN0b3JhZ2VTdGFjayA9IG5ldyBQcm9kU3RvcmFnZVN0YWNrKHBpcGVsaW5lLnNjb3BlLCAnUHJvZFN0b3JhZ2VTdGFjaycsIHtcbiAgICAgICAgICAgIC4uLmRlcGxveW1lbnRQcm9wcyxcbiAgICAgICAgICAgIHByb2RBY2NvdW50czogW10sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlcGxveW1lbnRHcm91cFRhcmdldC5hZGRTdGFja3MocHJvZFN0b3JhZ2VTdGFjayk7XG4gICAgfVxufVxuIl19