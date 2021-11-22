#!/usr/bin/env bash
# Build the web extension distributions from the source code.
#
# This is a light-weight process as far as build processes go for typical software projects. All this script does is
# copy some files around. There are no dependency download steps or compilation steps.
#
# Specifically, this will create the directories:
#   * build/chromium-manifest-v2-web-extension/
#   * build/firefox-manifest-v2-web-extension/
#
# The contents of these directories are ready to be loaded into the browser as web extensions! See the README for
# instructions.
#
# Optionally, use the "--watch" option to build the distributions continually as source code files are changed. This
# requires using the "fswatch" tool. Refer to the documentation: https://github.com/emcrisostomo/fswatch.

if [[ "$1" == "--watch" ]]; then
  watch=true
else
  watch=false
fi

set -eu

project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
extension_sources=(firefox-manifest-v2 chromium-manifest-v2)

preconditions() {
  if ! which deno &> /dev/null; then
    echo >&2 "The 'deno' command was not found. Please install Deno. See https://deno.land/."
    exit 1
  fi
}

build_distribution() {
  local extension_source="$1"
  local source_dir="$project_dir/src/${extension_source}"
  local output_dir="$project_dir/build/${extension_source}-web-extension"

  # Delete the build directory and everything inside of it if it already exists and then create it again.
  mkdir -p "$output_dir"
  rm -rf "$output_dir"
  mkdir -p "$output_dir"

  # Copy over the source code that is specific to this extension distribution.
  deno bundle "$source_dir/init.js" "$output_dir/init.js"
  cp "$source_dir/manifest.json" "$output_dir"

  # Copy over the source code that is common across all extension distributions.
  cp -r "$project_dir/src/backend" "$output_dir"
  deno bundle "$project_dir/src/backend/popup.js" "$output_dir/backend/popup.js"
  cp -r "$project_dir/src/web-page" "$output_dir"
  deno bundle "$project_dir/src/web-page/web-load-source.js" "$output_dir/web-page/web-load-source.js"
  cp -r "$project_dir/src/rpc" "$output_dir"
}

build_all() {
  for extension_source in "${extension_sources[@]}"; do
    build_distribution "$extension_source"
  done
  echo "Distributions built! ✅"
}

preconditions

if [[ "$watch" == "true" ]]; then
  echo "Building with the '--watch' option. The distributions will be built again when any of the 'src/' code changes."
  build_all
  fswatch -0 src/ | while read -d "" event; do build_all; done
else
  build_all
fi
