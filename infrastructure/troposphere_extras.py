from troposphere import GetAtt, Ref, ImportValue
from troposphere.awslambda import Function, Code, DeadLetterConfig, Permission
from troposphere.events import Rule, Target
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
    kwargs["Runtime"] = "nodejs8.10"
    return create_lambda_fn(name, code, dead_letter_queue, **kwargs)

def create_lambda_fn(name, code, dead_letter_queue, **kwargs):
    kwargs["Code"] = code
    kwargs["Timeout"] = 30
    kwargs["DeadLetterConfig"] = DeadLetterConfig(TargetArn=ImportValue('core-dead-letter-queue'))
    return Function(name, **kwargs)

def create_lambda_fn_cron(name_prefix, lambda_fn, schedule_expression):
    rule = Rule(
            '{}EventRule'.format(name_prefix),
            ScheduleExpression=schedule_expression,
            Targets=[Target(
                Arn=GetAtt(lambda_fn, 'Arn'),
                Id=lambda_fn.name
                )]
            )

    permission = Permission(
            '{}LambdaFunctionPermission'.format(name_prefix),
            Action="lambda:InvokeFunction",
            FunctionName=GetAtt(lambda_fn, 'Arn'),
            Principal='events.amazonaws.com',
            SourceArn=GetAtt(rule, 'Arn')
            )

    return (rule, permission)

def create_stepfnjson_getobject(prefix, key):
    sn_get_object_data = 'GetObjectData_{}'.format(prefix)
    sn_get_object = 'GetObject_{}'.format(prefix)

    return {
            "StartAt": sn_get_object_data,
            "States": {
                sn_get_object_data: {
                    "Type": "Pass",
                    "Result": {
                        "key": key,
                        "bucket": 'pain-reduce-bucket-1pgi6btsv9d97'
                        },
                    "Next": sn_get_object
                    },
                sn_get_object: {
                    "Type": "Task",
                    "Resource": "arn:aws:lambda:eu-west-1:855277617897:function:pain-reduce-GetObjectLambdaFunction-BPKE1Z01IP1R",
                    "End": True
                    }
                }
            }

