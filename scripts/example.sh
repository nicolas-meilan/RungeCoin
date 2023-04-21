eval $(./scripts/parsedEnv.sh)

npm run build-android-release

./scripts/uploadBuild.sh
