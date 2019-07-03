#!/bin/bash
# compile source
browserify src/index.ts -p tsify > build/index.js
uglifyjs -cm -o build/index.min.js build/index.js
sassc styles.scss > build/styles.css
# copy static files
mkdir -p build/assets
cp assets/icon.svg build/assets/icon.svg
cp assets/library.svg build/assets/library.svg
cp assets/tab.svg build/assets/tab.svg
cp ctrl-e.html build/ctrl-e.html
# compress assets
svgo build/assets/icon.svg
svgo build/assets/library.svg
svgo build/assets/tab.svg
# remove intermediary files
rm build/index.js