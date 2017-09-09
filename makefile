PROJECT_NAME=pain-reduce
PACKAGE_BUCKET=kieran-bamforth
PACKAGE_KEY=lambda-packages/$(PROJECT_NAME).zip
CF_STACK_NAME=pain-reduce

install-deps:
	npm install

zip-package: install-deps
	rm $(PROJECT_NAME).zip || true
	zip -r ./$(PROJECT_NAME).zip ./

upload-package: zip-package
	aws s3 cp $(PROJECT_NAME).zip s3://$(PACKAGE_BUCKET)/$(PACKAGE_KEY)

# Cloudformation.
cloudformation-stack:
	aws cloudformation create-stack \
		--stack-name $(CF_STACK_NAME) \
		--template-body file://infrastructure.yml \
		--capabilities CAPABILITY_IAM

update-cloudformation-stack:
	aws cloudformation update-stack \
		--stack-name $(CF_STACK_NAME) \
		--template-body file://infrastructure.yml \
		--capabilities CAPABILITY_IAM
