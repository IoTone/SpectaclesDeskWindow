#!/bin/sh
# ffmpeg -f avfoundation -i "default" -framerate 15 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -b:v 600k -f rtsp rtsp://localhost:8554/test
# ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "0:none" out.avi
# ffmpeg -f avfoundation -framerate 30 -i "0:none" -c:v libx264 -pix_fmt yuv420p -b:v 600k -f rtsp rtsp://localhost:8554/test
# ffmpeg -fflags +igndts -f avfoundation -framerate 30 -i "0:none" -c:v libx265 -pix_fmt yuv420p -c:a ac3 -max_muxing_queue_size 9999 -f rtsp rtsp://localhost:8554/test
# ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "0:none" -c:v libx264 -preset ultrafast -tune zerolatency -f mpegts udp://127.0.0.1:12345
# ffmpeg -f avfoundation -framerate 30 -video_size 1440x900 -i "1:none" -c:v libx264 -preset ultrafast -pix_fmt yuv420p output.mp4
#
# http://johnriselvato.com/ffmpeg-how-to-record-macos-screen/
# ffmpeg -f avfoundation -list_devices true -i ""
# figure out your devices and set them up here
# if you need to set the mic up or other audio source, change none.  Read
# the docs!
# ffmpeg -f avfoundation -framerate 60 -video_size 1920x1080 -i "4:none" -c:v libx264 -preset ultrafast -pix_fmt yuv420p -tune zerolatency -f rtsp rtsp://localhost:8554/test
# ffmpeg -fflags +igndts -avoid_negative_ts make_zero -f avfoundation -framerate 60 -video_size 1920x1080 -i "4:none" -c:v libx264 -profile:v baseline -pix_fmt yuv420p -tune zerolatency -f rtsp rtsp://localhost:8554/test
ffmpeg -f avfoundation -framerate 60 -r 18  -video_size 1920x1080 -i "4:none" -c:v libx264 -profile:v baseline -pix_fmt yuv420p -f rtsp rtsp://localhost:8554/test
