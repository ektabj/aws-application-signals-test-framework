"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Bucket = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const constructs_1 = require("constructs");
/* Construct that represents a bucket that can be shared with other accounts.

    This construct can be shared with up to 200 accounts approximately
*/
class S3Bucket extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.bucket = new aws_s3_1.Bucket(scope, `bucket-${props.bucketName}`, {
            bucketName: props.bucketName,
            blockPublicAccess: aws_s3_1.BlockPublicAccess.BLOCK_ALL,
            encryption: aws_s3_1.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            // This will avoid the bucket is deleted in case the stack is removed.
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.RETAIN,
        });
        if (props.policy) {
            this.bucket.addToResourcePolicy(props.policy);
        }
        if (props.readAccounts.length > 0) {
            const statement = new aws_iam_1.PolicyStatement({
                effect: aws_iam_1.Effect.ALLOW,
                principals: props.readAccounts.map((account) => new aws_iam_1.ArnPrincipal(account)),
                actions: ['s3:GetObject'],
                resources: [`arn:aws:s3:::${props.bucketName}/*`],
            });
            this.bucket.addToResourcePolicy(statement);
        }
        props.readWriteRoles.forEach((role) => this.bucket.grantReadWrite(role));
    }
}
exports.S3Bucket = S3Bucket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvY29uc3RydWN0cy9zMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBNEM7QUFDNUMsaURBQXdGO0FBQ3hGLCtDQUFpRjtBQUNqRiwyQ0FBdUM7QUFhdkM7OztFQUdFO0FBQ0YsTUFBYSxRQUFTLFNBQVEsc0JBQVM7SUFFbkMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFvQjtRQUMxRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsS0FBSyxFQUFFLFVBQVUsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQzFELFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixpQkFBaUIsRUFBRSwwQkFBaUIsQ0FBQyxTQUFTO1lBQzlDLFVBQVUsRUFBRSx5QkFBZ0IsQ0FBQyxVQUFVO1lBQ3ZDLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFNBQVMsRUFBRSxJQUFJO1lBQ2Ysc0VBQXNFO1lBQ3RFLGFBQWEsRUFBRSwyQkFBYSxDQUFDLE1BQU07U0FDdEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDakQ7UUFFRCxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvQixNQUFNLFNBQVMsR0FBRyxJQUFJLHlCQUFlLENBQUM7Z0JBQ2xDLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxzQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMxRSxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUM7Z0JBQ3pCLFNBQVMsRUFBRSxDQUFDLGdCQUFnQixLQUFLLENBQUMsVUFBVSxJQUFJLENBQUM7YUFDcEQsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM5QztRQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7Q0FDSjtBQS9CRCw0QkErQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZW1vdmFsUG9saWN5IH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQXJuUHJpbmNpcGFsLCBFZmZlY3QsIElHcmFudGFibGUsIFBvbGljeVN0YXRlbWVudCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQmxvY2tQdWJsaWNBY2Nlc3MsIEJ1Y2tldCwgQnVja2V0RW5jcnlwdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuaW50ZXJmYWNlIFMzQnVja2V0UHJvcHMge1xuICAgIC8vIE5hbWUgb2YgdGhlIGJ1Y2tldCB0byBzaGFyZVxuICAgIGJ1Y2tldE5hbWU6IHN0cmluZztcbiAgICAvLyBBY2NvdW50cyB0aGF0IGNhbiByZWFkIHRoZSBidWNrZXRcbiAgICByZWFkQWNjb3VudHM6IHN0cmluZ1tdO1xuICAgIC8vIFJvbGVzIHRoYXQgY2FuIHJlYWQgYW5kIHdyaXRlIHRvIHRoZSBidWNrZXRcbiAgICByZWFkV3JpdGVSb2xlczogSUdyYW50YWJsZVtdO1xuICAgIC8vIEFuIG9wdGlvbmFsIHBvbGljeSB0byBhdHRhY2ggdG8gdGhlIGJ1Y2tldFxuICAgIHBvbGljeT86IFBvbGljeVN0YXRlbWVudDtcbn1cblxuLyogQ29uc3RydWN0IHRoYXQgcmVwcmVzZW50cyBhIGJ1Y2tldCB0aGF0IGNhbiBiZSBzaGFyZWQgd2l0aCBvdGhlciBhY2NvdW50cy5cblxuICAgIFRoaXMgY29uc3RydWN0IGNhbiBiZSBzaGFyZWQgd2l0aCB1cCB0byAyMDAgYWNjb3VudHMgYXBwcm94aW1hdGVseVxuKi9cbmV4cG9ydCBjbGFzcyBTM0J1Y2tldCBleHRlbmRzIENvbnN0cnVjdCB7XG4gICAgcmVhZG9ubHkgYnVja2V0OiBCdWNrZXQ7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IFMzQnVja2V0UHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICB0aGlzLmJ1Y2tldCA9IG5ldyBCdWNrZXQoc2NvcGUsIGBidWNrZXQtJHtwcm9wcy5idWNrZXROYW1lfWAsIHtcbiAgICAgICAgICAgIGJ1Y2tldE5hbWU6IHByb3BzLmJ1Y2tldE5hbWUsXG4gICAgICAgICAgICBibG9ja1B1YmxpY0FjY2VzczogQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuICAgICAgICAgICAgZW5jcnlwdGlvbjogQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuICAgICAgICAgICAgZW5mb3JjZVNTTDogdHJ1ZSxcbiAgICAgICAgICAgIHZlcnNpb25lZDogdHJ1ZSxcbiAgICAgICAgICAgIC8vIFRoaXMgd2lsbCBhdm9pZCB0aGUgYnVja2V0IGlzIGRlbGV0ZWQgaW4gY2FzZSB0aGUgc3RhY2sgaXMgcmVtb3ZlZC5cbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocHJvcHMucG9saWN5KSB7XG4gICAgICAgICAgICB0aGlzLmJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KHByb3BzLnBvbGljeSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvcHMucmVhZEFjY291bnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlbWVudCA9IG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIHByaW5jaXBhbHM6IHByb3BzLnJlYWRBY2NvdW50cy5tYXAoKGFjY291bnQpID0+IG5ldyBBcm5QcmluY2lwYWwoYWNjb3VudCkpLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0J10sXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6czM6Ojoke3Byb3BzLmJ1Y2tldE5hbWV9LypgXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5idWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShzdGF0ZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvcHMucmVhZFdyaXRlUm9sZXMuZm9yRWFjaCgocm9sZSkgPT4gdGhpcy5idWNrZXQuZ3JhbnRSZWFkV3JpdGUocm9sZSkpO1xuICAgIH1cbn1cbiJdfQ==