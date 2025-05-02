#!/usr/bin/env python
# encoding: utf-8

# /*
#  * Copyright 2025 IoTone Japan
#  *
#  * Licensed under the Apache License, Version 2.0 (the "License");
#  * you may not use this file except in compliance with the License.
#  * You may obtain a copy of the License at
#  *
#  *      https://www.apache.org/licenses/LICENSE-2.0
#  *
#  * Unless required by applicable law or agreed to in writing, software
#  * distributed under the License is distributed on an "AS IS" BASIS,
#  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  * See the License for the specific language governing permissions and
#  * limitations under the License.
#  */
from flask import Flask
import time
import subprocess
import os
import glob
from flask import send_file
from flask import Response
from flask import render_template 
import platform

app = Flask(__name__)

#
# Global functions
#
# Global Utilities
#
def current_milli_time():
    return round(time.time() * 1000)



@app.route("/")
def home():
    return "Hello, dwsvc World!"

@app.route("/dws")
def dws():
    try:
        thisos = platform.system()
        if thisos == "Darwin":
            cmd = "/usr/sbin/screencapture -tpng -R 0,0,800,600 -x mac-screencapture.png".split()
            proc = subprocess.call(cmd, shell=False)
        elif thisos == "Linux":
            proc = subprocess.Popen("/usr/bin/weston-screenshooter")
        else:
            pass 
    except Exception as e:
        print(e)
    list_of_files = glob.glob('./*.png') # * means all if need specific format then *.csv
    latest_screenshot = max(list_of_files, key=os.path.getmtime)
    return send_file(latest_screenshot, mimetype='image/png')

@app.route("/camerafeed")
def camerafeed():
    return render_template('camera_feed.html')

if __name__ == "__main__":
    app.run(threaded=True,host='0.0.0.0', port=5002)
    # app.run(debug=True)
