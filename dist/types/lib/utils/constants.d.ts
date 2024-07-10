export declare enum Stage {
    Dev = "alpha",
    Gamma = "gamma",
    Prod = "prod"
}
export declare const apmTeleGenTeamEmail = "aws-xray-dev@amazon.com";
export declare const bindleGuid = "amzn1.bindle.resource.p6pbtbztgl36cczic6ha";
export declare const applicationAccount = "038041069243";
export declare const pipelineId = "6345931";
export declare const sfoAvailabilityZones: string[];
export declare const ADOT_PYTHON_ACCOUNT_ID = "637423224110";
export declare const ADOT_PYTHON_REGION = "us-east-1";
export declare const ADOT_PYTHON_NAME = "ADOT-Python";
/**** NON-PROD RESOURCE & ARTIFACTS ****/
export declare const S3_ADOT_PYTHON_STAGING = "adot-autoinstrumentation-python-staging";
export declare const ECR_ADOT_PYTHON_STAGING = "aws-observability/adot-autoinstrumentation-python-staging";
export declare const S3_ADOT_PYTHON_NIGHTLY = "adot-autoinstrumentation-python-nightly";
export declare const ECR_ADOT_PYTHON_NIGHTLY = "adot-autoinstrumentation-python-nightly";
export declare const S3_ADOT_DOTNET_STAGING = "adot-autoinstrumentation-dotnet-staging";
export declare const ECR_ADOT_DOTNET_STAGING = "aws-observability/adot-autoinstrumentation-dotnet-staging";
export declare const SECRET_ADOT_PYTHON_PYPI_TEST = "test/PyPI/apiToken";
export declare const SECRET_NVD_API_KEY = "NVD_API_KEY";
export declare const WORKFLOW_ROLE = "pulse-enablement-workflow-role";
/**** PROD RESOURCE & ARTIFACTS ****/
export declare const GH_WORKFLOW_PROD_ROLE = "pulse-enablement-gh-prod-role";
export declare const SECRET_ADOT_PYTHON_PYPI_PROD = "prod/PyPI/apiToken";
export declare const ECR_ADOT_PYTHON_ARS_SOURCE = "adot-autoinstrumentation-python";
