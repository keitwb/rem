TAG ?= dev

.PHONY: search-indexer
search-indexer:
	docker build --rm -t quay.io/rem/search-indexer:$(TAG) search

.PHONY: data-streamer
data-streamer:
	docker build --rm -t quay.io/rem/data-streamer:$(TAG) data-streamer

.PHONY: webapp
webapp:
	docker build --rm -t quay.io/rem/webapp:$(TAG) webapp

.PHONY: es
es:
	docker build --pull --rm -t quay.io/rem/es:$(TAG) datastores/es

.PHONY: mongo
mongo:
	docker build --rm -t quay.io/rem/mongo:$(TAG) datastores/mongo

.PHONY: mongo-dev-fixtures
mongo-dev-fixtures:
	docker build --rm -t quay.io/rem/mongo-dev-fixtures:$(TAG) dev/fixtures

.PHONY: parceldata
parceldata:
	docker build --rm -t quay.io/rem/parceldata:$(TAG) -f Dockerfile.parceldata .

images: data-streamer mongo es parceldata search-indexer #webapp
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
