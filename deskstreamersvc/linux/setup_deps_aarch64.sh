#!/bin/sh
# Install using apt, or use a more modern build below
# Note: these builds have GPL dependencies
# sudo apt install ffmpeg
wget https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linuxarm64-gpl.tar.xz
tar -xvf ffmpeg-master-latest-linuxarm64-gpl.tar.gz
wget https://github.com/bluenviron/mediamtx/releases/download/v1.12.0/mediamtx_v1.12.0_linux_arm64v8.tar.gz
tar -xvf mediamtx_v1.12.0_linux_arm64v8.tar.gz
chmod 744 mediamtx
npm install -S rtsp-relay express
