#!/usr/bin/env bash
# Remember to export all necessary env vars before running this script
if [ "$1" == "true" ]; then
    docker build . -t development2018/video-worker-d
fi
if [ "$2" == "true" ]; then
    docker push development2018/video-worker-d
fi