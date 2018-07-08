CF_METHOD=update
CF_STACK_NAME=pain-reduce
PACKAGE_BUCKET=kieran-bamforth
PACKAGE_KEY=lambda-packages/$(PROJECT_NAME).zip
PROJECT_NAME=pain-reduce
TELLER_AUTH=change-me
MONEY_SPREADSHEET_ID=1tdFtrQbeDSo_3ofbcS86k9U_xVcgoJLMZ7YEXHPbfD8

test:
	npm test

zip-package:
	rm -rf ./node_modules
	npm install --production
	rm $(PROJECT_NAME).zip || true
	zip -r $(PROJECT_NAME).zip ./src
	zip -r $(PROJECT_NAME).zip ./node_modules
	npm install

upload-package: zip-package
	aws s3 cp $(PROJECT_NAME).zip s3://$(PACKAGE_BUCKET)/$(PACKAGE_KEY)

cloudformation-stack:
	./venv/bin/python infrastructure/infrastructure.py > infrastructure/infrastructure.json
	aws cloudformation $(CF_METHOD)-stack \
		--stack-name $(CF_STACK_NAME) \
		--template-body file://infrastructure/infrastructure.json \
		--capabilities CAPABILITY_IAM \
		--parameters \
			ParameterKey=PackageBucket,ParameterValue=$(PACKAGE_BUCKET) \
			ParameterKey=PackageKey,ParameterValue=$(PACKAGE_KEY) \
			ParameterKey=TellerAuth,ParameterValue="$(TELLER_AUTH)" \
			ParameterKey=EmailAddress,ParameterValue="$(EMAIL_ADDRESS)" \
			ParameterKey=PropertyRefNo,ParameterValue="$(PROPERTY_REF_NO)" \
			ParameterKey=PostCode,ParameterValue="$(POST_CODE)" \
			ParameterKey=MoneySpreadsheetId,ParameterValue="$(MONEY_SPREADSHEET_ID)"

get-diff-function-arn:
	$(eval DIFF_FUNCTION_ARN := $(shell aws cloudformation describe-stacks --stack-name $(CF_STACK_NAME) \
		| jq '.Stacks[].Outputs[] | select (.OutputKey == "DiffAlertLambdaFunctionArn").OutputValue'))
	echo $(DIFF_FUNCTION_ARN)

lint:
	npm run lint

venv:
	virtualenv venv
	./venv/bin/pip install -r requirements.txt

.PHONY: venv
