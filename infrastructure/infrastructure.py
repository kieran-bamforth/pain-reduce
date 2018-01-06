from troposphere import Parameter, Output, GetAtt, Ref, Template, Join
from troposphere.iam import Policy
from troposphere.s3 import Bucket, BucketPolicy
from troposphere.sns import Topic, Subscription
from troposphere_extras import create_lambda_role

if __name__ == '__main__':
    template = Template()

    template.add_parameter(Parameter(
        'LatestPackageVersion',
        Type='String'
        ))
    template.add_parameter(Parameter(
        'PackageBucket',
        Type='String'
        ))
    template.add_parameter(Parameter(
        'PackageKey',
        Type='String'
        ))
    template.add_parameter(Parameter(
        'TellerAuth',
        Type='String'
        ))
    template.add_parameter(Parameter(
        'EmailAddress',
        Type='String'
        ))
    template.add_parameter(Parameter(
        'PropertyRefNo',
        Type='String'
        ))

    s3_bucket = template.add_resource(Bucket('Bucket'))

    dead_letter_queue = template.add_resource(Topic(
        'DeadLetterQueue',
        Subscription=[Subscription(
            Endpoint=Ref('EmailAddress'),
            Protocol='email'
            )]
        ))

    lambda_role_dump_teller_response = template.add_resource(create_lambda_role(
        'DumpTellerResponseLambdaRole',
        Policies=[
            Policy(
                PolicyName='S3Access',
                PolicyDocument={
                    'Version': '2012-10-17',
                    'Statement': [
                        {
                            'Effect': 'Allow',
                            'Action': 's3.PutObject',
                            'Resource': Join('', [
                                'arn:aws:s3:::', Ref(s3_bucket), '/teller-responses/*'
                                ])
                            }
                        ]
                    }
                ),
            Policy(
                PolicyName='SNSPublish',
                PolicyDocument={
                    'Version': '2012-10-17',
                    'Statement': [
                        {
                            'Effect': 'Allow',
                            'Action': 'sns:Publish',
                            'Resource': Ref(dead_letter_queue)
                            }
                        ]
                    }
                )
            ]
        ))

    lambda_role_diff_alert = template.add_resource(create_lambda_role(
        'DiffAlertLambdaRole',
        Policies=[
            Policy(
                PolicyName='S3GetObject',
                PolicyDocument={
                    'Version': '2012-10-17',
                    'Statement': [
                        {
                            'Effect': 'Allow',
                            'Action': 's3.GetObject',
                            'Resource': Join('', [
                                'arn:aws:s3:::', Ref(s3_bucket), '/*'
                                ])
                            }
                        ]
                    }
                ),
            Policy(
                PolicyName='S3ListBucket',
                PolicyDocument={
                    'Version': '2012-10-17',
                    'Statement': [
                        {
                            'Effect': 'Allow',
                            'Action': 's3:ListBucket',
                            'Resource': Join('', [
                                'arn:aws:s3:::', Ref(s3_bucket)])
                            }
                        ]
                    }
                ),
            Policy(
                PolicyName='SESSendEmail',
                PolicyDocument={
                    'Version': '2012-10-17',
                    'Statement': [
                        {
                            'Effect': 'Allow',
                            'Action': 'ses:SendEmail',
                            'Resource': '*'
                            }
                        ]
                    }
                ),
            Policy(
                PolicyName='SNSPublish',
                PolicyDocument={
                    'Version': '2012-10-17',
                    'Statement': [
                        {
                            'Effect': 'Allow',
                            'Action': 'sns:Publish',
                            'Resource': Ref(dead_letter_queue)
                            }
                        ]
                    }
                )
            ]
        ))

    s3_bucket_policy = template.add_resource(BucketPolicy(
        'BucketPolicy',
        PolicyDocument={
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 's3:PutObject',
                    'Effect': 'Allow',
                    'Resource': Join('', [
                        'arn:aws:s3:::', Ref(s3_bucket), '/teller-responses/*'
                        ]),
                    'Principal': {
                        'AWS': GetAtt(lambda_role_dump_teller_response, 'Arn')
                        }
                    },
                {
                    'Action': 's3:GetObject',
                    'Effect': 'Allow',
                    'Resource': Join('', [
                        'arn:aws:s3:::', Ref(s3_bucket), '/*'
                        ]),
                    'Principal': {
                        'AWS': GetAtt(lambda_role_diff_alert, 'Arn')
                        }
                    },
                {
                    'Action': 's3:ListBucket',
                    'Effect': 'Allow',
                    'Resource': Join('', [
                        'arn:aws:s3:::', Ref(s3_bucket)
                        ]),
                    'Principal': {
                        'AWS': GetAtt(lambda_role_diff_alert, 'Arn')
                        }
                    }
                ]
            },
        Bucket=Ref(s3_bucket)
        ))

    print(template.to_json())
