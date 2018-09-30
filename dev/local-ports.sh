#!/bin/bash

# Forwards the backend services running on some k8s cluster to localhost for easy local development
# without having to run minikube locally.

kubectl port-forward mongo-0 27017 &
kubectl port-forward es-0 9200 &
kubectl port-forward deployment/data-streamer 8080
