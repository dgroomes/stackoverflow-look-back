#!/usr/bin/env bash
# Build the web extension distributions from the source code.
#
# Specifically, this will create the directory:
#   * build/chromium-manifest-v2-web-extension/
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
bef_dir="$project_dir/browser-extension-framework"
bef_dist="$bef_dir/framework/dgroomes-browser-extension-framework-0.1.0.tgz"

# We can't support Firefox because I can't test with it.
extension_sources=(chromium-manifest-v2)

preconditions() {
  if [[ ! -f "$bef_dist" ]]; then
    echo >&2 "The BrowserExtensionFramework distribution was not found in '$bef_dist'. Build the BrowserExtensionFramework distribution by following the instructions in the README"
    exit 1
  fi
}

build_distribution() {
  local extension_source="$1"
  local vendor_source_dir="$project_dir/src/${extension_source}"
  local vendor_output_dir="$project_dir/build/${extension_source}-web-extension"
  local webpack_output_dir="$project_dir/dist"

  # Delete the build directory and everything inside of it if it already exists and then create it again.
  mkdir -p "$vendor_output_dir"
  rm -rf "$vendor_output_dir"
  mkdir -p "$vendor_output_dir/backend" "$vendor_output_dir/rpc-framework" "$vendor_output_dir/web-page"

  # Copy over the vendor-specific Manifest file and the vendor-specific initialization JavaScript file
  cp "$vendor_source_dir/manifest.json" "$vendor_output_dir"
  cp "$webpack_output_dir/$extension_source-init.js" "$vendor_output_dir/init.js"

  # Copy over non-TypeScript files (don't bother using fancy shell scripting here. Just copy over the few files explicitly)
  cp \
    "$project_dir/src/web-page/posts-viewer.html" \
    "$project_dir/src/web-page/posts-viewer.css" \
    "$vendor_output_dir/web-page"

  cp "$project_dir/src/backend/popup.html" "$vendor_output_dir/backend"

  # Copy over the entrypoint-type files
  cp "$webpack_output_dir/popup.js" "$vendor_output_dir/backend/popup.js"

  cp "$webpack_output_dir/votes-page-script.js" "$vendor_output_dir/web-page/votes-page-script.js"
  cp "$webpack_output_dir/posts-page-script.js" "$vendor_output_dir/web-page/posts-page-script.js"

  cp "$project_dir/node_modules/@dgroomes/browser-extension-framework/dist/content-script-middleware.js" "$vendor_output_dir"
  cp "$webpack_output_dir/posts-viewer.js" "$vendor_output_dir/web-page/posts-viewer.js"
}

build_all() {
  echo "Building..."
  local build_status=0

  # Allow failures (set +e). It's expected that the build will often fail because as new code is written it won't
  # compile.
  set +e
  for extension_source in "${extension_sources[@]}"; do
    if ! build_distribution "$extension_source"; then
      # If the vendor-specific build failed (Chromium or FireFox) break now and don't bother building the other
      # vendor-specific distribution.
      build_status=1
      break
    fi
  done
  # Disallow failures again. If there is an exception, that's unexpected and should terminate the script.
  set -e

  if [[ $build_status = 0 ]]; then
    echo "Distributions built! ✅"
  else
    echo >&2 "Build failed ❌"
  fi
}

preconditions

if [[ "$watch" == "true" ]]; then
  echo "Building with the '--watch' option. The distributions will be built again when any source code changes."
  build_all
  fswatch -0 src/ util/ browser-extension-framework/ | while read -d "" event; do build_all; done
else
  build_all
fi
