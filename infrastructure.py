from troposphere import Parameter, Output, GetAtt, Ref, Template
from troposphere.s3 import Bucket

if __name__ == "__main__":
    template = Template()

    param = template.add_parameter(Parameter(
        "LatestPackageVersion",
        Type="String"
        ))
    param = template.add_parameter(Parameter(
        "PackageBucket",
        Type="String"
        ))
    param = template.add_parameter(Parameter(
        "PackageKey",
        Type="String"
        ))
    param = template.add_parameter(Parameter(
        "TellerAuth",
        Type="String"
        ))
    param = template.add_parameter(Parameter(
        "EmailAddress",
        Type="String"
        ))
    param = template.add_parameter(Parameter(
        "PropertyRefNo",
        Type="String"
        ))

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
                        # "AWS": "!GetAtt ["DumpTellerResponseLambdaRole", "Arn"]"
                        }
                    },
                {
                    "Action": "s3:GetObject",
                    "Effect": "Allow",
                    "Resource": Join("", [
                        "arn:aws:s3:::", Ref(s3_bucket), "/*"
                        ]),
                    "Principal": {
                        # "AWS": "!GetAtt ["DiffAlertLambdaRole", "Arn"]"
                        }
                    },
                {
                    "Action": "s3:ListBucket",
                    "Effect": "Allow",
                    "Resource": Join("", [
                        "arn:aws:s3:::", Ref(s3_bucket)
                        ]),
                    "Principal": {
                        # "AWS": "!GetAtt ["DiffAlertLambdaRole", "Arn"]"
                        }
                    }
                ]
            },
        Bucket=Ref(s3_bucket)
        ))

    print(template.to_json())
