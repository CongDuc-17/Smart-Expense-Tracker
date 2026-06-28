#! /bin/env zsh

docker run --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smart_expense \
  -p 5432:5432 \
  -d postgres:16