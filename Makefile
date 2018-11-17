TAG ?= dev
PUSH ?= no

.PHONY: search-indexer
search-indexer:
	docker build --rm -t quay.io/rem/$@:$(TAG) search
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: data-streamer
data-streamer:
	docker build --rm -t quay.io/rem/$@:$(TAG) data-streamer
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: webapp
webapp:
	docker build --rm -t quay.io/rem/$@:$(TAG) webapp
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: es
es:
	docker build --pull --rm -t quay.io/rem/$@:$(TAG) datastores/es
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: mongo
mongo:
	docker build --rm -t quay.io/rem/$@:$(TAG) datastores/mongo
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: mongo-dev-fixtures
mongo-dev-fixtures:
	docker build --rm -t quay.io/rem/$@:$(TAG) dev/fixtures
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

.PHONY: parceldata
parceldata:
	docker build --rm -t quay.io/rem/$@:$(TAG) -f Dockerfile.parceldata .
	[[ "$(PUSH)" != "yes" ]] || docker push quay.io/rem/$@:$(TAG)

images: data-streamer mongo es parceldata search-indexer webapp mongo-dev-fixtures
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
