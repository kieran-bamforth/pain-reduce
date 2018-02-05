CF_METHOD=update
CF_STACK_NAME=pain-reduce
PACKAGE_BUCKET=kieran-bamforth
PACKAGE_KEY=lambda-packages/$(PROJECT_NAME).zip
PROJECT_NAME=pain-reduce
TELLER_AUTH=change-me

zip-package:
	rm -rf ./node_modules
	npm install --production
	rm $(PROJECT_NAME).zip || true
	zip -r $(PROJECT_NAME).zip ./src
	zip -r $(PROJECT_NAME).zip ./node_modules
	npm install

upload-package: zip-package
	aws s3 cp $(PROJECT_NAME).zip s3://$(PACKAGE_BUCKET)/$(PACKAGE_KEY)

cloudformation-stack: get-latest-package-version
	./venv/bin/python infrastructure/infrastructure.py > infrastructure/infrastructure.json
	aws cloudformation $(CF_METHOD)-stack \
		--stack-name $(CF_STACK_NAME) \
		--template-body file://infrastructure/infrastructure.json \
		--capabilities CAPABILITY_IAM \
		--parameters \
			ParameterKey=LatestPackageVersion,ParameterValue=$(LATEST_PACKAGE_VERSION) \
			ParameterKey=PackageBucket,ParameterValue=$(PACKAGE_BUCKET) \
			ParameterKey=PackageKey,ParameterValue=$(PACKAGE_KEY) \
			ParameterKey=TellerAuth,ParameterValue="$(TELLER_AUTH)" \
			ParameterKey=EmailAddress,ParameterValue="$(EMAIL_ADDRESS)" \
			ParameterKey=PropertyRefNo,ParameterValue="$(PROPERTY_REF_NO)" \
			ParameterKey=PostCode,ParameterValue="$(POST_CODE)"

get-latest-package-version:
	$(eval LATEST_PACKAGE_VERSION := $(shell aws s3api list-object-versions --bucket $(PACKAGE_BUCKET) --prefix $(PACKAGE_KEY) \
		| jq -r '.Versions[] | select(.IsLatest == true).VersionId'))

get-diff-function-arn:
	$(eval DIFF_FUNCTION_ARN := $(shell aws cloudformation describe-stacks --stack-name $(CF_STACK_NAME) \
		| jq '.Stacks[].Outputs[] | select (.OutputKey == "DiffAlertLambdaFunctionArn").OutputValue'))
	echo $(DIFF_FUNCTION_ARN)

invoke-diff-function: get-diff-function-arn
	aws lambda invoke --function-name $(DIFF_FUNCTION_ARN) \
		--invocation-type RequestResponse \
		--log-type Tail \
		--payload file://$(PWD)/tests/s3-put-notification.json \
		diff.invoked.txt

lint:
	npm run lint

venv:
	virtualenv venv
	./venv/bin/pip install -r requirements.txt

.PHONY: venv
