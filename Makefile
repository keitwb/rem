TAG ?= $(USER)
PUSH ?= no

.PHONY: search-indexer
search-indexer:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f search/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: data-streamer
data-streamer:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f data-streamer/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: tax-info
tax-info:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f tax-info/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: webapp
webapp:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f webapp/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: parceldata
parceldata:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f parceldata/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: auth
auth:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f auth/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: thumbnailer
thumbnailer:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f thumbnailer/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

images: auth search-indexer data-streamer tax-info webapp parceldata thumbnailer
	true

.PHONY: helm-dev
helm-dev:
	dev/helm-dev

.PHONY: reset-dev-db
reset-dev-db:
	dev/bin/reset-db
