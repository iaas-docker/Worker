#!/usr/bin/env bash
# Remember to export all necessary env vars before running this script
if [ "$1" == "true" ]; then
    docker build . -t iaas-uniandes/worker
fi
if [ "$2" == "true" ]; then
    docker push iaas-uniandes/worker
fi