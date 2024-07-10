"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubOidcIamRole = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const constructs_1 = require("constructs");
const IAM_ROLE_DURATION = aws_cdk_lib_1.Duration.hours(8);
/**
 * @remark This construct deploys a single IAM Role which will utilize the GitHub
 * OIDC Provider as a WebIdentity. This Role can then be assumed in a
 * GitHub Actions workflow run from any of the repositories listed in the
 * repoConfigs object array.
 */
class GitHubOidcIamRole extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const conditions = {
            StringLike: {
                [`${props.githubProvider.domainName}:sub`]: props.repoConfigs.map((repoStruct) => `repo:${repoStruct.organization}/${repoStruct.repository}:*`),
            },
        };
        new aws_iam_1.Role(this, `GitHubWorkflowRole-${props.roleName}`, {
            assumedBy: new aws_iam_1.WebIdentityPrincipal(props.githubProvider.githubProvider.openIdConnectProviderArn, conditions),
            managedPolicies: props.managedPolicies,
            inlinePolicies: props.inlinePolicies,
            roleName: props.roleName,
            maxSessionDuration: IAM_ROLE_DURATION,
        });
    }
}
exports.GitHubOidcIamRole = GitHubOidcIamRole;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy1yb2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL2NvbnN0cnVjdHMvb2lkYy1yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUF1QztBQUN2QyxpREFBNkc7QUFDN0csMkNBQXVDO0FBR3ZDLE1BQU0saUJBQWlCLEdBQUcsc0JBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFrQjVDOzs7OztHQUtHO0FBQ0gsTUFBYSxpQkFBa0IsU0FBUSxzQkFBUztJQUM1QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTZCO1FBQ25FLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsTUFBTSxVQUFVLEdBQWU7WUFDM0IsVUFBVSxFQUFFO2dCQUNSLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQVUsTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQzdELENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxRQUFRLFVBQVUsQ0FBQyxZQUFZLElBQUksVUFBVSxDQUFDLFVBQVUsSUFBSSxDQUMvRTthQUNKO1NBQ0osQ0FBQztRQUNGLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSxzQkFBc0IsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25ELFNBQVMsRUFBRSxJQUFJLDhCQUFvQixDQUMvQixLQUFLLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsRUFDNUQsVUFBVSxDQUNiO1lBQ0QsZUFBZSxFQUFFLEtBQUssQ0FBQyxlQUFlO1lBQ3RDLGNBQWMsRUFBRSxLQUFLLENBQUMsY0FBYztZQUNwQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDeEIsa0JBQWtCLEVBQUUsaUJBQWlCO1NBQ3hDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXJCRCw4Q0FxQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbmRpdGlvbnMsIElNYW5hZ2VkUG9saWN5LCBQb2xpY3lEb2N1bWVudCwgUm9sZSwgV2ViSWRlbnRpdHlQcmluY2lwYWwgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgR2l0SHViT0lEQ1Byb3ZpZGVyIH0gZnJvbSAnLi9vaWRjLXByb3ZpZGVyJztcblxuY29uc3QgSUFNX1JPTEVfRFVSQVRJT04gPSBEdXJhdGlvbi5ob3Vycyg4KTtcbi8qKlxuICogQHBhcmFtIHJvbGVOYW1lIC0gdGhlIG5hbWUgb2YgdGhlIElBTSBSb2xlXG4gKiBAcGFyYW0gcmVwb0NvbmZpZ3MgLSBBIGxpc3Qgb2Ygb3JnYW5pemF0aW9ucyBhbmQgcmVwb3NpdG9yaWVzIHRoYXQgd2lsbCBiZSBtYXBwZWQgaW50byB0aGUgSUFNIFJvbGUgQ29uZGl0aW9ucy5cbiAqIFVzZXMgYSBTdHJpbmdMaWtlIG1hdGNoIGFuZCBjYW4gdGh1cyB1c2UgKiBhbmQgPyBmb3IgY2hhcmFjdGVyIHJlcGxhY2VtZW50LlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL0lBTS9sYXRlc3QvVXNlckd1aWRlL3JlZmVyZW5jZV9wb2xpY2llc19lbGVtZW50c19jb25kaXRpb25fb3BlcmF0b3JzLmh0bWwjQ29uZGl0aW9uc19TdHJpbmd9XG4gKiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqIEBwYXJhbSBtYW5hZ2VkUG9saWNpZXMgLSBhIGxpc3Qgb2YgQVdTIE1hbmFnZWQgcG9saWNpZXMgdG8gYWRkIHRvIHRoZSBJQU0gUm9sZVxuICogQHBhcmFtIGlubGluZVBvbGljaWVzIC0gYSBsaXN0IG9mIGlubGluZSBwb2xpY2llcyB0byBhZGQgdG8gdGhlIElBTSBSb2xlXG4gKiBAcGFyYW0gZ2l0SHViUHJvdmlkZXIgLSBHaXRIdWIgT0lEQyBQcm92aWRlclxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdEh1Yk9pZGNJYW1Sb2xlUHJvcHMge1xuICAgIHJvbGVOYW1lOiBzdHJpbmc7XG4gICAgcmVwb0NvbmZpZ3M6IHsgb3JnYW5pemF0aW9uOiBzdHJpbmc7IHJlcG9zaXRvcnk6IHN0cmluZyB9W107XG4gICAgbWFuYWdlZFBvbGljaWVzPzogSU1hbmFnZWRQb2xpY3lbXTtcbiAgICBpbmxpbmVQb2xpY2llcz86IHsgW25hbWU6IHN0cmluZ106IFBvbGljeURvY3VtZW50IH07XG4gICAgZ2l0aHViUHJvdmlkZXI6IEdpdEh1Yk9JRENQcm92aWRlcjtcbn1cbi8qKlxuICogQHJlbWFyayBUaGlzIGNvbnN0cnVjdCBkZXBsb3lzIGEgc2luZ2xlIElBTSBSb2xlIHdoaWNoIHdpbGwgdXRpbGl6ZSB0aGUgR2l0SHViXG4gKiBPSURDIFByb3ZpZGVyIGFzIGEgV2ViSWRlbnRpdHkuIFRoaXMgUm9sZSBjYW4gdGhlbiBiZSBhc3N1bWVkIGluIGFcbiAqIEdpdEh1YiBBY3Rpb25zIHdvcmtmbG93IHJ1biBmcm9tIGFueSBvZiB0aGUgcmVwb3NpdG9yaWVzIGxpc3RlZCBpbiB0aGVcbiAqIHJlcG9Db25maWdzIG9iamVjdCBhcnJheS5cbiAqL1xuZXhwb3J0IGNsYXNzIEdpdEh1Yk9pZGNJYW1Sb2xlIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogR2l0SHViT2lkY0lhbVJvbGVQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgICAgICBjb25zdCBjb25kaXRpb25zOiBDb25kaXRpb25zID0ge1xuICAgICAgICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICAgICAgICAgIFtgJHtwcm9wcy5naXRodWJQcm92aWRlci5kb21haW5OYW1lfTpzdWJgXTogcHJvcHMucmVwb0NvbmZpZ3MubWFwKFxuICAgICAgICAgICAgICAgICAgICAocmVwb1N0cnVjdCkgPT4gYHJlcG86JHtyZXBvU3RydWN0Lm9yZ2FuaXphdGlvbn0vJHtyZXBvU3RydWN0LnJlcG9zaXRvcnl9OipgLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBuZXcgUm9sZSh0aGlzLCBgR2l0SHViV29ya2Zsb3dSb2xlLSR7cHJvcHMucm9sZU5hbWV9YCwge1xuICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgV2ViSWRlbnRpdHlQcmluY2lwYWwoXG4gICAgICAgICAgICAgICAgcHJvcHMuZ2l0aHViUHJvdmlkZXIuZ2l0aHViUHJvdmlkZXIub3BlbklkQ29ubmVjdFByb3ZpZGVyQXJuLFxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbnMsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBwcm9wcy5tYW5hZ2VkUG9saWNpZXMsXG4gICAgICAgICAgICBpbmxpbmVQb2xpY2llczogcHJvcHMuaW5saW5lUG9saWNpZXMsXG4gICAgICAgICAgICByb2xlTmFtZTogcHJvcHMucm9sZU5hbWUsXG4gICAgICAgICAgICBtYXhTZXNzaW9uRHVyYXRpb246IElBTV9ST0xFX0RVUkFUSU9OLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=