#!/bin/sh
cp ../svcs/* .
curl -LO https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip
unzip ffmpeg-master-latest-win64-gpl.zip
curl -LO https://github.com/bluenviron/mediamtx/releases/download/v1.12.0/mediamtx_v1.12.0_windows_amd64.zip
unzip mediamtx_v1.12.0_windows_amd64.zip
# chmod 744 mediamtx
npm install .
# npm install -S rtsp-relay express