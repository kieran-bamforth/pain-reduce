from troposphere import Ref
from troposphere.awslambda import Function, Code, DeadLetterConfig
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

def create_lambda_fn_node(name, code, dead_letter_queue, **kwargs):
    kwargs["Runtime"] = "nodejs6.10"
    return create_lambda_fn(name, code, dead_letter_queue, **kwargs)

def create_lambda_fn(name, code, dead_letter_queue, **kwargs):
    kwargs["Code"] = code
    kwargs["Timeout"] = 30
    kwargs["DeadLetterConfig"] = DeadLetterConfig(TargetArn=Ref(dead_letter_queue))
    return Function(name, **kwargs)
