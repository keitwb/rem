TAG ?= dev

.PHONY: restheart-image
restheart-image:
	docker build --rm -t quay.io/rem/restheart:$(TAG) mongo/restheart

.PHONY: search-indexer-image
search-indexer-image:
	docker build --rm -t quay.io/rem/search-indexer:$(TAG) search

.PHONY: update-streamer-image
update-streamer-image:
	docker build --rm -t quay.io/rem/update-streamer:$(TAG) update-streamer

.PHONY: webapp-image
webapp-image:
	docker build --rm -t quay.io/rem/webapp:$(TAG) webapp

.PHONY: mongo-setup-image
mongo-setup-image:
	docker build --rm -t quay.io/rem/mongo-setup:$(TAG) mongo/migrations

.PHONY: mongo-dev-fixtures-image
mongo-dev-fixtures-image:
	docker build --rm -t quay.io/rem/mongo-dev-fixtures dev/fixtures

.PHONY: gis-parcel-data-image
gis-parcel-data-image:
	docker build --rm -t quay.io/rem/gis-parcel-data:$(TAG) -f gis/Dockerfile --target parcel-data gis

images: restheart-image update-streamer-image mongo-setup-image gis-parcel-data-image search-indexer-image #webapp-image
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
