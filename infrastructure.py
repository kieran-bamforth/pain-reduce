from troposphere import Parameter, Output, GetAtt, Ref, Template, Join
from troposphere.iam import Role
from troposphere.s3 import Bucket, BucketPolicy

import pdb

def create_lambda_role(role_name):
    return Role(
            role_name,
            AssumeRolePolicyDocument={
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {
                            "Service": [
                                "lambda.amazonaws.com"
                                ]
                            },
                        "Action": [
                            "sts:AssumeRole"
                            ]
                        }
                    ]
                },
            ManagedPolicyArns=["arn:aws:iam::aws:policy/AWSLambdaExecute"],
            Policies=[]
            )

if __name__ == "__main__":
    template = Template()

    template.add_parameter(Parameter(
        "LatestPackageVersion",
        Type="String"
        ))
    template.add_parameter(Parameter(
        "PackageBucket",
        Type="String"
        ))
    template.add_parameter(Parameter(
        "PackageKey",
        Type="String"
        ))
    template.add_parameter(Parameter(
        "TellerAuth",
        Type="String"
        ))
    template.add_parameter(Parameter(
        "EmailAddress",
        Type="String"
        ))
    template.add_parameter(Parameter(
        "PropertyRefNo",
        Type="String"
        ))

    lambda_role_dump_teller_response = template.add_resource(
            create_lambda_role("DumpTellerResponseLambdaRole")
            )

    lambda_role_diff_alert = template.add_resource(
            create_lambda_role("DiffAlertLambdaRole")
            )

    s3_bucket = template.add_resource(Bucket("Bucket"))

    s3_bucket_policy = template.add_resource(BucketPolicy(
        "BucketPolicy",
        PolicyDocument={
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "s3:PutObject",
                    "Effect": "Allow",
                    "Resource": Join("", [
                        "arn:aws:s3:::", Ref(s3_bucket), "/teller-responses/*"
                        ]),
                    "Principal": {
                        "AWS": GetAtt(lambda_role_dump_teller_response, "Arn")
                        }
                    },
                {
                    "Action": "s3:GetObject",
                    "Effect": "Allow",
                    "Resource": Join("", [
                        "arn:aws:s3:::", Ref(s3_bucket), "/*"
                        ]),
                    "Principal": {
                        "AWS": GetAtt(lambda_role_diff_alert, "Arn")
                        }
                    },
                {
                    "Action": "s3:ListBucket",
                    "Effect": "Allow",
                    "Resource": Join("", [
                        "arn:aws:s3:::", Ref(s3_bucket)
                        ]),
                    "Principal": {
                        "AWS": GetAtt(lambda_role_diff_alert, "Arn")
                        }
                    }
                ]
            },
        Bucket=Ref(s3_bucket)
        ))

    print(template.to_json())
