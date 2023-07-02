#!/bin/bash

unset -v message

while getopts m: flag
do
    case "${flag}" in
      m) message=${OPTARG};;
    esac
done

shift "$(( OPTIND - 1 ))"

if [ -z "$message" ]; then
  appcenter distribute stores publish\
    -f ./android/app/build/outputs/bundle/release/app-release.aab\
    --store Production
  exit 0
fi

appcenter distribute stores publish\
  -f ./android/app/build/outputs/bundle/release/app-release.aab\
  --store Production\
  --release-notes "$message"
