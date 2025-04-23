#!/bin/sh
brew install ffmpeg
wget https://github.com/bluenviron/mediamtx/releases/download/v1.12.0/mediamtx_v1.12.0_darwin_amd64.tar.gz
# tar -xvf mediamtx_v1.12.0_darwin_amd64.tar.gz 
chmod 744 mediamtx
npm install -S rtsp-relay express
