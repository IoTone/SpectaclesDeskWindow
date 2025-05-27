#!/bin/sh
# ffmpeg -f avfoundation -i "default" -framerate 15 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -b:v 600k -f rtsp rtsp://localhost:8554/test
# ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "0:none" out.avi
# ffmpeg -f avfoundation -framerate 30 -i "0:none" -c:v libx264 -pix_fmt yuv420p -b:v 600k -f rtsp rtsp://localhost:8554/test
# ffmpeg -fflags +igndts -f avfoundation -framerate 30 -i "0:none" -c:v libx265 -pix_fmt yuv420p -c:a ac3 -max_muxing_queue_size 9999 -f rtsp rtsp://localhost:8554/test
# ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "0:none" -c:v libx264 -preset ultrafast -tune zerolatency -f mpegts udp://127.0.0.1:12345
#
# ffmpeg -f avfoundation -list_devices true -i ""
# change to your camera, may not be 0 or 1
./ffmpeg-master-latest-win64-gpl/bin/ffmpeg -y -f dshow -i video="c922 Pro Stream Webcam" -framerate 30 -video_size 640x480 -c:v libx264 -preset ultrafast -tune zerolatency -f rtsp rtsp://localhost:8554/test

