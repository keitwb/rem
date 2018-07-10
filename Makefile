TAG ?= dev

.PHONY: restheart
restheart:
	docker build --rm -t quay.io/rem/restheart:$(TAG) datastores/mongo/restheart

.PHONY: search-indexer
search-indexer:
	docker build --rm -t quay.io/rem/search-indexer:$(TAG) search

.PHONY: update-streamer
update-streamer:
	docker build --rm -t quay.io/rem/update-streamer:$(TAG) update-streamer

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
	docker build --rm -t quay.io/rem/mongo-dev-fixtures dev/fixtures

.PHONY: gis-parcel-data
gis-parcel-data:
	docker build --rm -t quay.io/rem/gis-parcel-data:$(TAG) -f gis/Dockerfile --target parcel-data gis

images: restheart update-streamer mongo es gis-parcel-data search-indexer #webapp
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
