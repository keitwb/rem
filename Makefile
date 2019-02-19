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

.PHONY: es
es:
	docker build --pull --rm -t quay.io/rem/$@:$(TAG) -f datastores/es/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: mongo
mongo:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f datastores/mongo/Dockerfile .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: mongo-dev-fixtures
mongo-dev-fixtures:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f dev/fixtures/Dockerfile .
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

images: auth search-indexer data-streamer tax-info webapp es mongo mongo-dev-fixtures parceldata thumbnailer
	true

.PHONY: minikube-kvm
minikube:
	dev/run-minikube

.PHONY: helm-dev
helm-dev:
	dev/helm-dev

minikube-etc-hosts:
	sudo sed -i -e "s/.* rem.dev/$$(minikube ip --profile rem) rem.dev/" /etc/hosts

.PHONY: reset-dev-db
reset-dev-db:
	dev/bin/reset-db
