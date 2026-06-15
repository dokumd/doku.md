#!/bin/bash
VERSION=$(jq -r .version app.json)
git tag $VERSION
git push origin $VERSION