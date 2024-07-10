"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECRRepo = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_ecr_1 = require("aws-cdk-lib/aws-ecr");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const constructs_1 = require("constructs");
/*
    This class is used to share an ecr repository between accounts.

    This construct can be shared with up to 200 accounts approximately
*/
class ECRRepo extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.ecr = new aws_ecr_1.Repository(this, `ecr-${props.name}`, {
            imageScanOnPush: true,
            repositoryName: props.name,
            // This will avoid that the
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.RETAIN,
        });
        if (props.policy) {
            this.ecr.addToResourcePolicy(props.policy);
        }
        if (props.pullAccounts.length > 0) {
            // We are doing this to use the least amount of space for adding permission
            // since resource policies can have up to 10240 characters
            const statement = new aws_iam_1.PolicyStatement({
                actions: ['ecr:BatchGetImage', 'ecr:GetDownloadUrlForLayer'],
                effect: aws_iam_1.Effect.ALLOW,
                principals: props.pullAccounts.map((account) => new aws_iam_1.ArnPrincipal(account)),
            });
            this.ecr.addToResourcePolicy(statement);
        }
        props.pushPullRoles.forEach((role) => this.ecr.grantPullPush(role));
    }
}
exports.ECRRepo = ECRRepo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL2NvbnN0cnVjdHMvZWNyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUE0QztBQUM1QyxpREFBaUQ7QUFDakQsaURBQXdGO0FBQ3hGLDJDQUF1QztBQWV2Qzs7OztFQUlFO0FBQ0YsTUFBYSxPQUFRLFNBQVEsc0JBQVM7SUFFbEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFtQjtRQUN6RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxvQkFBVSxDQUFDLElBQUksRUFBRSxPQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNqRCxlQUFlLEVBQUUsSUFBSTtZQUNyQixjQUFjLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDMUIsMkJBQTJCO1lBQzNCLGFBQWEsRUFBRSwyQkFBYSxDQUFDLE1BQU07U0FDdEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDOUM7UUFFRCxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvQiwyRUFBMkU7WUFDM0UsMERBQTBEO1lBQzFELE1BQU0sU0FBUyxHQUFHLElBQUkseUJBQWUsQ0FBQztnQkFDbEMsT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsNEJBQTRCLENBQUM7Z0JBQzVELE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxzQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzdFLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0M7UUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0o7QUE3QkQsMEJBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFJlcG9zaXRvcnkgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNyJztcbmltcG9ydCB7IEFyblByaW5jaXBhbCwgRWZmZWN0LCBJR3JhbnRhYmxlLCBQb2xpY3lTdGF0ZW1lbnQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVDUlJlcG9Qcm9wcyB7XG4gICAgLy8gVGhlIGFjY291bnRzIHRoYXQgd2lsbCBiZSBhYmxlIHRvIHB1bGwgaW1hZ2VzIGZyb20gdGhpcyBlY3IgcmVwb3NpdG9yeS5cbiAgICAvLyBVcCB0byAyMDAgYWNjb3VudHMgYXJlIHN1cHBvcnRlZC5cbiAgICAvLyBXZSB3aWxsIGludGVudGlvbmFsbHkgbGV0IGNsb3VkZm9ybWF0aW9uIGZhaWwgaW4gY2FzZSB0aGVyZSBpcyBubyBtb3JlIGFjY291bnRzIGxlZnRcbiAgICAvLyB0byBiZSBpbnNlcnRlZCBpbnN0ZWFkIG9mIHByZWRpY3RpbmcgdGhlIGV4YWN0IGxpbWl0IG91cnNlbHZlcy5cbiAgICBwdWxsQWNjb3VudHM6IHN0cmluZ1tdO1xuICAgIC8vIFRoZSByb2xlcyB0aGF0IHdpbGwgYmUgYWJsZSB0byBwdXNoIGFuZCBwdWxsIGltYWdlcyBmcm9tIHRoaXMgZWNyIHJlcG9zaXRvcnkuXG4gICAgcHVzaFB1bGxSb2xlczogSUdyYW50YWJsZVtdO1xuICAgIC8vIE5hbWUgIG9mIHRoZSBlY3IgcmVwb3NpdG9yeS5cbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgLy8gQW4gb3B0aW9uYWwgcG9saWN5IHRvIGF0dGFjaCB0aGUgUmVwb1xuICAgIHBvbGljeT86IFBvbGljeVN0YXRlbWVudDtcbn1cbi8qXG4gICAgVGhpcyBjbGFzcyBpcyB1c2VkIHRvIHNoYXJlIGFuIGVjciByZXBvc2l0b3J5IGJldHdlZW4gYWNjb3VudHMuXG5cbiAgICBUaGlzIGNvbnN0cnVjdCBjYW4gYmUgc2hhcmVkIHdpdGggdXAgdG8gMjAwIGFjY291bnRzIGFwcHJveGltYXRlbHlcbiovXG5leHBvcnQgY2xhc3MgRUNSUmVwbyBleHRlbmRzIENvbnN0cnVjdCB7XG4gICAgcmVhZG9ubHkgZWNyOiBSZXBvc2l0b3J5O1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBFQ1JSZXBvUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICB0aGlzLmVjciA9IG5ldyBSZXBvc2l0b3J5KHRoaXMsIGBlY3ItJHtwcm9wcy5uYW1lfWAsIHtcbiAgICAgICAgICAgIGltYWdlU2Nhbk9uUHVzaDogdHJ1ZSxcbiAgICAgICAgICAgIHJlcG9zaXRvcnlOYW1lOiBwcm9wcy5uYW1lLFxuICAgICAgICAgICAgLy8gVGhpcyB3aWxsIGF2b2lkIHRoYXQgdGhlXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHByb3BzLnBvbGljeSkge1xuICAgICAgICAgICAgdGhpcy5lY3IuYWRkVG9SZXNvdXJjZVBvbGljeShwcm9wcy5wb2xpY3kpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb3BzLnB1bGxBY2NvdW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgZG9pbmcgdGhpcyB0byB1c2UgdGhlIGxlYXN0IGFtb3VudCBvZiBzcGFjZSBmb3IgYWRkaW5nIHBlcm1pc3Npb25cbiAgICAgICAgICAgIC8vIHNpbmNlIHJlc291cmNlIHBvbGljaWVzIGNhbiBoYXZlIHVwIHRvIDEwMjQwIGNoYXJhY3RlcnNcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlbWVudCA9IG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsnZWNyOkJhdGNoR2V0SW1hZ2UnLCAnZWNyOkdldERvd25sb2FkVXJsRm9yTGF5ZXInXSxcbiAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICBwcmluY2lwYWxzOiBwcm9wcy5wdWxsQWNjb3VudHMubWFwKChhY2NvdW50KSA9PiBuZXcgQXJuUHJpbmNpcGFsKGFjY291bnQpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lY3IuYWRkVG9SZXNvdXJjZVBvbGljeShzdGF0ZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvcHMucHVzaFB1bGxSb2xlcy5mb3JFYWNoKChyb2xlKSA9PiB0aGlzLmVjci5ncmFudFB1bGxQdXNoKHJvbGUpKTtcbiAgICB9XG59XG4iXX0=