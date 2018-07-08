import json

from troposphere import Parameter, Output, GetAtt, Ref, Template, Join, ImportValue
from troposphere.awslambda import Code, Environment
from troposphere.events import Rule, Target
from troposphere.iam import Policy
from troposphere.iam import Role
from troposphere.s3 import Bucket, BucketPolicy
from troposphere.sns import Topic, Subscription
from troposphere.stepfunctions import StateMachine
from troposphere_extras import create_lambda_role, create_lambda_fn_node, create_lambda_fn_cron, create_stepfnjson_getobject

if __name__ == '__main__':
    template = Template()

    param_package_bucket = template.add_parameter(Parameter(
        'PackageBucket',
        Type='String'
        ))
    param_package_key = template.add_parameter(Parameter(
        'PackageKey',
        Type='String'
        ))
    param_teller_auth = template.add_parameter(Parameter(
        'TellerAuth',
        Type='String'
        ))
    param_money_spreadsheet_id = template.add_parameter(Parameter(
        'MoneySpreadsheetId',
        Type='String'
        ))
    param_email_address = template.add_parameter(Parameter(
        'EmailAddress',
        Type='String'
        ))
    param_post_code = template.add_parameter(Parameter(
        'PostCode',
        Type='String'
        ))
    param_property_ref_no = template.add_parameter(Parameter(
        'PropertyRefNo',
        Type='String'
        ))

    s3_bucket = template.add_resource(Bucket('Bucket'))

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
                            'Action': 's3:PutObject',
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
                            'Resource': ImportValue('core-dead-letter-queue')
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
                            'Action': 's3:GetObject',
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
                            'Resource': ImportValue('core-dead-letter-queue')
                            }
                        ]
                    }
                )
            ]
        ))

    lambda_role_can_email = template.add_resource(create_lambda_role(
        'BinAlertLambdaRole',
        Policies=[
            Policy(
                PolicyName='SESSendEmail',
                PolicyDocument={
                    'Version': '2012-10-17',
                    'Statement': [{
                        'Effect': 'Allow',
                        'Action': 'ses:SendEmail',
                        'Resource': '*'
                        }]
                    }
                ),
            Policy(
                PolicyName='SNSPublish',
                PolicyDocument={
                    'Version': '2012-10-17',
                    'Statement': [{
                        'Effect': 'Allow',
                        'Action': 'sns:Publish',
                        'Resource': ImportValue('core-dead-letter-queue')
                        }]
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

    lambda_code = Code(
            S3Bucket=Ref(param_package_bucket),
            S3Key=Ref(param_package_key)
        )

    lambda_fn_dump_teller = template.add_resource(create_lambda_fn_node(
        'DumpTellerLambdaFunction',
        lambda_code,
        ImportValue('core-dead-letter-queue'),
        Description='Makes a couple reqeusts to the Teller API and dumps the responses to S3.',
        Environment=Environment(Variables={
            'AUTH': Ref(param_teller_auth),
            'BUCKET': Ref(s3_bucket)
            }),
        Handler='src/dump-teller-responses.index',
        Role=GetAtt(lambda_role_dump_teller_response, 'Arn')
        ))

    lambda_fn_bin_alert = template.add_resource(create_lambda_fn_node(
        'BinAlertLambdaFunction',
        lambda_code,
        ImportValue('core-dead-letter-queue'),
        Description='Sends what bins to take out',
        Environment=Environment(Variables={
            'EMAIL_ADDRESS': Ref(param_email_address),
            'PROPERTY_REF_NO': Ref(param_property_ref_no),
            'POST_CODE': Ref(param_post_code),
            }),
        Handler='src/bin-alert.binAlert',
        Role=GetAtt(lambda_role_can_email, 'Arn')
        ))

    lambda_fn_daily_dollar = template.add_resource(create_lambda_fn_node(
        'DailyDollarLambdaFunction',
        lambda_code,
        ImportValue('core-dead-letter-queue'),
        Description='Send an email to explain how much money I have left',
        Environment=Environment(Variables={
            'BUCKET': Ref(s3_bucket),
            'MONEY_SPREADSHEET_ID': Ref(param_money_spreadsheet_id),
            'EMAIL_ADDRESS': Ref(param_email_address),
            }),
        Handler='src/daily-dollar.dailyDollar',
        Role=GetAtt(lambda_role_can_email, 'Arn')
        ))

    lambda_fn_diff_alert = template.add_resource(create_lambda_fn_node(
        'DiffAlertLambdaFunction',
        lambda_code,
        ImportValue('core-dead-letter-queue'),
        Description='Diffs a new S3 object against an older one, and alerts if there is a difference.',
        Environment=Environment(Variables={
            'EMAIL_ADDRESS': Ref(param_email_address)
            }),
        Handler='src/diff-alert.diffAlert',
        Role=GetAtt(lambda_role_diff_alert, 'Arn')
        ))

    lambda_fn_crons = [
            create_lambda_fn_cron('DumpTeller', lambda_fn_dump_teller, 'cron(0 9 ? * MON *)'),
            create_lambda_fn_cron('BinAlert', lambda_fn_bin_alert, 'cron(0 18 ? * TUE *)'),
            create_lambda_fn_cron('DailyDollar', lambda_fn_daily_dollar, 'cron(0 8 ? * * *)')
            ]
    for rule, permission in lambda_fn_crons:
        template.add_resource(rule)
        template.add_resource(permission)

    print(template.to_json())
