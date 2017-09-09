CF_METHOD=update
CF_STACK_NAME=pain-reduce
PACKAGE_BUCKET=kieran-bamforth
PACKAGE_KEY=lambda-packages/$(PROJECT_NAME).zip
PROJECT_NAME=pain-reduce
TELLER_AUTH=change-me

install-deps:
	npm install

zip-package: install-deps
	rm $(PROJECT_NAME).zip || true
	zip -r ./$(PROJECT_NAME).zip ./

upload-package: zip-package
	aws s3 cp $(PROJECT_NAME).zip s3://$(PACKAGE_BUCKET)/$(PACKAGE_KEY)

cloudformation-stack: get-latest-package-version
	aws cloudformation $(CF_METHOD)-stack \
		--stack-name $(CF_STACK_NAME) \
		--template-body file://infrastructure.yml \
		--capabilities CAPABILITY_IAM \
		--parameters \
			ParameterKey=LatestPackageVersion,ParameterValue=$(LATEST_PACKAGE_VERSION) \
			ParameterKey=PackageBucket,ParameterValue=$(PACKAGE_BUCKET) \
			ParameterKey=PackageKey,ParameterValue=$(PACKAGE_KEY) \
			ParameterKey=TellerAuth,ParameterValue=$(TELLER_AUTH)

get-latest-package-version:
	$(eval LATEST_PACKAGE_VERSION := $(shell aws s3api list-object-versions --bucket $(PACKAGE_BUCKET) --prefix $(PACKAGE_KEY) \
		| jq -r '.Versions[] | select(.IsLatest == true).VersionId'))
