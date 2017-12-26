TAG ?= latest

.PHONY: restheart
restheart:
	docker build --rm -t quay.io/rem/restheart:$(TAG) mongodb/restheart

.PHONY: update-streamer
update-streamer:
	docker build --rm -t quay.io/rem/update-streamer:$(TAG) update-streamer

.PHONY: webapp
webapp:
	docker build --rm -t quay.io/rem/webapp:$(TAG) webapp

.PHONY: mongodb-setup
mongodb-setup:
	docker build --rm -t quay.io/rem/mongodb-setup:$(TAG) mongodb
