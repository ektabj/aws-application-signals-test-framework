import { DeploymentEnvironment } from '@amzn/pipelines';
import { App } from 'aws-cdk-lib';
import { E2ETestCommonStack } from '../stacks/e2eTestCommonStack';
import { Ec2JavaTestStack } from '../stacks/ec2JavaTestStack';
import { EksJavaTestStack } from '../stacks/eksJavaTestStack';
import { EksMetricLimiterJavaTestStack } from '../stacks/eksMetricLimiterJavaTestStack';
import { EksPythonTestStack } from '../stacks/eksPythonTestStack';
import { EksDotnetTestStack } from '../stacks/eksDotnetTestStack';
import { AdotE2EReleaseTestingStack } from '../stacks/release-testing/adotE2EReleaseTestingStack';
import { AdotPythonE2EReleaseTestingStack } from '../stacks/release-testing/adotPythonE2EReleaseTestingStack';
import { CWAgentE2EReleaseTestingStack } from '../stacks/release-testing/cwAgentE2EReleaseTestingStack';
import { CWAgentOperatorE2EReleaseTestingStack } from '../stacks/release-testing/cwAgentOperatorE2EReleaseTestingStack';
import { EnablementScriptE2EReleaseTestingStack } from '../stacks/release-testing/enablementScriptE2EReleaseTestingStack';
import { CWAgentOperatorPythonE2EReleaseTestingStack } from '../stacks/release-testing/cwAgentOperatorPythonE2EReleaseTestingStack';
import { EksPlaygroundStack } from '../stacks/eksPlaygroundStack';
import { Stage } from '../utils/constants';
import { GithubRunnerImagesStack } from '../stacks/githubRunnerImagesStack';
export interface AppStacksProps {
    readonly env: DeploymentEnvironment;
    readonly stage: Stage;
}
export interface AppStacks {
    readonly eks_java_test_stack: EksJavaTestStack;
    readonly eks_metric_limiter_java_test_stack: EksMetricLimiterJavaTestStack;
    readonly ec2_java_test_stack: Ec2JavaTestStack;
    readonly eks_python_test_stack: EksPythonTestStack;
    readonly eks_dotnet_test_stack: EksDotnetTestStack;
    readonly e2e_test_common_stack: E2ETestCommonStack;
    readonly adot_e2e_release_testing_stack: AdotE2EReleaseTestingStack | undefined;
    readonly adot_python_e2e_release_testing_stack: AdotPythonE2EReleaseTestingStack | undefined;
    readonly cw_agent_e2e_release_testing_stack: CWAgentE2EReleaseTestingStack | undefined;
    readonly cw_agent_operator_e2e_release_testing_stack: CWAgentOperatorE2EReleaseTestingStack | undefined;
    readonly cw_agent_operator_python_e2e_release_testing_stack: CWAgentOperatorPythonE2EReleaseTestingStack | undefined;
    readonly enablement_script_e2e_release_testing_stack: EnablementScriptE2EReleaseTestingStack | undefined;
    readonly github_runner_images_stack: GithubRunnerImagesStack | undefined;
    readonly eks_playground_stack: EksPlaygroundStack | undefined;
}
export declare const addAppStacks: (app: App, { env, stage }: AppStacksProps) => AppStacks;
