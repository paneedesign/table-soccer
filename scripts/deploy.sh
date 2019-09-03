#!/usr/bin/env bash
vue-cli-service --mode $1 build && firebase deploy -P $1 --only hosting
