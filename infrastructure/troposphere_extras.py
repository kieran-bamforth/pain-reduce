from troposphere.iam import Role
import pdb

def create_lambda_role(role_name, **kwargs):
    policies=kwargs["Policies"]
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
            Policies=policies
            )

