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

    print(template.to_json())
