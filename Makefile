.PHONY: generate-courses version-bump build-deploy

generate-courses:
	@echo "Generating courses.json..."
	node scripts/generateCourses.js 

version-bump:
	@echo "Bumping minor version..."
	@VERSION=$$(jq -r '.expo.version' app.json) && \
	MAJOR=$$(echo $$VERSION | cut -d. -f1) && \
	MINOR=$$(echo $$VERSION | cut -d. -f2) && \
	PATCH=$$(echo $$VERSION | cut -d. -f3) && \
	NEW_MINOR=$$((MINOR + 1)) && \
	NEW_VERSION="$$MAJOR.$$NEW_MINOR.$$PATCH" && \
	jq '.expo.version = "'"$$NEW_VERSION"'"' app.json > tmp.json && mv tmp.json app.json && \
	echo "Version bumped to $$NEW_VERSION"

build-deploy:
	@echo "Running iOS prebuild..."
	npm run prebuild:ios
	@echo "Building for iOS..."
	npm run build:ios
	@echo "Submitting to TestFlight..."
	npm run submit:ios

bump-and-build: version-bump build-deploy 