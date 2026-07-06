#!/bin/bash

trap 'echo "\nKill all processes"; kill 0' SIGINT

CONTAINER_ID="2cfe2704ea32"
(docker container start $CONTAINER_ID)

echo "Waiting for database..."

sleep 15

echo "Starting BE..."

(cd BE && npm run db:push && npm install && npm run dev) &

echo "Starting FE..."
(cd FE && npm install && npm run dev) &

echo "Press Ctrl+C to stop all"

wait