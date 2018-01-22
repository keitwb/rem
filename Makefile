TAG ?= dev

.PHONY: restheart-image
restheart-image:
	docker build --rm -t quay.io/rem/restheart:$(TAG) mongodb/restheart

.PHONY: update-streamer-image
update-streamer-image:
	docker build --rm -t quay.io/rem/update-streamer:$(TAG) update-streamer

.PHONY: webapp-image
webapp-image:
	docker build --rm -t quay.io/rem/webapp:$(TAG) webapp

.PHONY: mongodb-setup-image
mongodb-setup-image:
	docker build --rm -t quay.io/rem/mongodb-setup:$(TAG) mongodb

images: restheart-image update-streamer-image mongodb-setup-image webapp-image
	true

.PHONY: minikube-kvm
minikube-kvm:
	minikube start --vm-driver kvm2 --cpus 4 --mount --kubernetes-version v1.8.0 --bootstrapper kubeadm
	kubectl config set-context minikube --namespace rem

.PHONY: reset-dev-db
reset-dev-db:
	dev/bin/reset-db
