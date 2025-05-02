#!/bin/sh
ffmpeg -f v4l2 -i /dev/video$1  -c:v libx264 -pix_fmt yuv420p -preset ultrafast -b:v 600k -f rtsp rtsp://localhost:8554/test
