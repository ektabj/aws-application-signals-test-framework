"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cdk_lib_1 = require("aws-cdk-lib");
const pipelines_1 = require("@amzn/pipelines");
const assertions_1 = require("aws-cdk-lib/assertions");
const staging_storage_stack_1 = require("../../lib/stacks/staging_storage_stack");
const prod_storage_stack_1 = require("../../lib/stacks/prod_storage_stack");
const accountId = '123456789012';
const pipelineId = '1223123123123';
const region = 'us-west-2';
const deploymentEnvironment = pipelines_1.DeploymentEnvironmentFactory.fromAccountAndRegion(accountId, region, pipelineId);
describe('StagingStorageStack', () => {
    it('Creates Staging storage stack', () => {
        const app = new aws_cdk_lib_1.App();
        const betaDeploymentProps = {
            env: deploymentEnvironment,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
            stage: 'beta',
        };
        const stagingStorageStack = new staging_storage_stack_1.StagingStorageStack(app, 'StagingStorageStack', {
            ...betaDeploymentProps,
            betaAccounts: [],
            stagingAccounts: [],
        });
        const template = assertions_1.Template.fromStack(stagingStorageStack);
        expect(template).toMatchSnapshot();
    });
});
describe('ProdStorageStack', () => {
    it('Creates Prod storage stack', () => {
        const app = new aws_cdk_lib_1.App();
        const prodDeploymentProps = {
            env: deploymentEnvironment,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
            stage: 'prod',
        };
        const prodStorageStack = new prod_storage_stack_1.ProdStorageStack(app, 'ProdStorageStack', {
            ...prodDeploymentProps,
            prodAccounts: [],
        });
        const template = assertions_1.Template.fromStack(prodStorageStack);
        expect(template).toMatchSnapshot();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9zdG9yYWdlL3N0b3JhZ2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFrQztBQUNsQywrQ0FBNkU7QUFDN0UsdURBQWtEO0FBQ2xELGtGQUE2RTtBQUM3RSw0RUFBdUU7QUFFdkUsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDO0FBQ2pDLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQztBQUNuQyxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUM7QUFDM0IsTUFBTSxxQkFBcUIsR0FBRyx3Q0FBNEIsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRS9HLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDakMsRUFBRSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtRQUNyQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQztRQUN0QixNQUFNLG1CQUFtQixHQUFHO1lBQ3hCLEdBQUcsRUFBRSxxQkFBcUI7WUFDMUIsWUFBWSxFQUFFLHdCQUFZLENBQUMsY0FBYztZQUN6QyxLQUFLLEVBQUUsTUFBTTtTQUNoQixDQUFDO1FBQ0YsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLDJDQUFtQixDQUFDLEdBQUcsRUFBRSxxQkFBcUIsRUFBRTtZQUM1RSxHQUFHLG1CQUFtQjtZQUN0QixZQUFZLEVBQUUsRUFBRTtZQUNoQixlQUFlLEVBQUUsRUFBRTtTQUN0QixDQUFDLENBQUM7UUFFSCxNQUFNLFFBQVEsR0FBRyxxQkFBUSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDO0FBRUgsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUM5QixFQUFFLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1FBQ2xDLE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sbUJBQW1CLEdBQUc7WUFDeEIsR0FBRyxFQUFFLHFCQUFxQjtZQUMxQixZQUFZLEVBQUUsd0JBQVksQ0FBQyxjQUFjO1lBQ3pDLEtBQUssRUFBRSxNQUFNO1NBQ2hCLENBQUM7UUFDRixNQUFNLGdCQUFnQixHQUFHLElBQUkscUNBQWdCLENBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFFO1lBQ25FLEdBQUcsbUJBQW1CO1lBQ3RCLFlBQVksRUFBRSxFQUFFO1NBQ25CLENBQUMsQ0FBQztRQUVILE1BQU0sUUFBUSxHQUFHLHFCQUFRLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBEZXBsb3ltZW50RW52aXJvbm1lbnRGYWN0b3J5LCBTb2Z0d2FyZVR5cGUgfSBmcm9tICdAYW16bi9waXBlbGluZXMnO1xuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJztcbmltcG9ydCB7IFN0YWdpbmdTdG9yYWdlU3RhY2sgfSBmcm9tICcuLi8uLi9saWIvc3RhY2tzL3N0YWdpbmdfc3RvcmFnZV9zdGFjayc7XG5pbXBvcnQgeyBQcm9kU3RvcmFnZVN0YWNrIH0gZnJvbSAnLi4vLi4vbGliL3N0YWNrcy9wcm9kX3N0b3JhZ2Vfc3RhY2snO1xuXG5jb25zdCBhY2NvdW50SWQgPSAnMTIzNDU2Nzg5MDEyJztcbmNvbnN0IHBpcGVsaW5lSWQgPSAnMTIyMzEyMzEyMzEyMyc7XG5jb25zdCByZWdpb24gPSAndXMtd2VzdC0yJztcbmNvbnN0IGRlcGxveW1lbnRFbnZpcm9ubWVudCA9IERlcGxveW1lbnRFbnZpcm9ubWVudEZhY3RvcnkuZnJvbUFjY291bnRBbmRSZWdpb24oYWNjb3VudElkLCByZWdpb24sIHBpcGVsaW5lSWQpO1xuXG5kZXNjcmliZSgnU3RhZ2luZ1N0b3JhZ2VTdGFjaycsICgpID0+IHtcbiAgICBpdCgnQ3JlYXRlcyBTdGFnaW5nIHN0b3JhZ2Ugc3RhY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcbiAgICAgICAgY29uc3QgYmV0YURlcGxveW1lbnRQcm9wcyA9IHtcbiAgICAgICAgICAgIGVudjogZGVwbG95bWVudEVudmlyb25tZW50LFxuICAgICAgICAgICAgc29mdHdhcmVUeXBlOiBTb2Z0d2FyZVR5cGUuSU5GUkFTVFJVQ1RVUkUsXG4gICAgICAgICAgICBzdGFnZTogJ2JldGEnLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdGFnaW5nU3RvcmFnZVN0YWNrID0gbmV3IFN0YWdpbmdTdG9yYWdlU3RhY2soYXBwLCAnU3RhZ2luZ1N0b3JhZ2VTdGFjaycsIHtcbiAgICAgICAgICAgIC4uLmJldGFEZXBsb3ltZW50UHJvcHMsXG4gICAgICAgICAgICBiZXRhQWNjb3VudHM6IFtdLFxuICAgICAgICAgICAgc3RhZ2luZ0FjY291bnRzOiBbXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2soc3RhZ2luZ1N0b3JhZ2VTdGFjayk7XG4gICAgICAgIGV4cGVjdCh0ZW1wbGF0ZSkudG9NYXRjaFNuYXBzaG90KCk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ1Byb2RTdG9yYWdlU3RhY2snLCAoKSA9PiB7XG4gICAgaXQoJ0NyZWF0ZXMgUHJvZCBzdG9yYWdlIHN0YWNrJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKCk7XG4gICAgICAgIGNvbnN0IHByb2REZXBsb3ltZW50UHJvcHMgPSB7XG4gICAgICAgICAgICBlbnY6IGRlcGxveW1lbnRFbnZpcm9ubWVudCxcbiAgICAgICAgICAgIHNvZnR3YXJlVHlwZTogU29mdHdhcmVUeXBlLklORlJBU1RSVUNUVVJFLFxuICAgICAgICAgICAgc3RhZ2U6ICdwcm9kJyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcHJvZFN0b3JhZ2VTdGFjayA9IG5ldyBQcm9kU3RvcmFnZVN0YWNrKGFwcCwgJ1Byb2RTdG9yYWdlU3RhY2snLCB7XG4gICAgICAgICAgICAuLi5wcm9kRGVwbG95bWVudFByb3BzLFxuICAgICAgICAgICAgcHJvZEFjY291bnRzOiBbXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2socHJvZFN0b3JhZ2VTdGFjayk7XG4gICAgICAgIGV4cGVjdCh0ZW1wbGF0ZSkudG9NYXRjaFNuYXBzaG90KCk7XG4gICAgfSk7XG59KTtcbiJdfQ==