# Overview

Spectacles DeskWindow is a spatial desktop mirroring solution.  You can "peek" at what is going on with any desktop.  It is an old trick used over the years to get simple mirroring working on platforms that don't support a full blown mirroring protocol. This is a first step PoC to show what is possible, and later versions will build up to progressively better approaches.

<img width="620" alt="Image" src="https://github.com/user-attachments/assets/d7eae522-c7a0-41dc-aa85-e1cf3d9fda40" />

Uses:

- Watch your stocks (lol whelp)
- Monitor a running program (a long build) while you go walk the dog
- Watch a silent movie
- Access a desktop only application

Demo: https://youtu.be/sr250zFttos

## Hardware Requirements

- 1 Snap Spectacles Gen5
- 1 Mac or Linux system (WINDOWS not supported yet)
- Some way to tunnel so you can serve HTTPS

## Setup

- You need to run dwscv, see below
- You need a tunnel to allow a secure HTTPS connection (see below)
- You need to get your tunnel URL and put it into the "WebView" component in your scene graph
- After that you can build and run


## Build

### dwsvc

On time setup: virtualenv menv && . ./menv/bin/activate && pip install -r requirements.txt

Run: python run.py

You can check your service running on localhost:5002/camerafeed in a regular browser.

To run on the spectacles, you need to set up a tunnel.  See the next step.

### Tunnel

It is recommended to use ngrok as the easiest way to make your tunnel.  There slightly more complex tunnel options possible using SSH, however, these are a bit harder to set up and maybe less stable depending on various factors.

See: https://ngrok.com/docs/getting-started/

The reason this approach is preferred is it is very stable.  The only downside is it is a paid service.  I will document other options in the future.

### DesktopWindow Spectacles Lens

It is easiest if you search in the scene object view and search for WebView.  Edit the component in the property editor and set the URL to your runnel.


## Run

Launch the DeskWindow Lens.  If you have configured the URLs correctly and tunnel, you can see the video in your browser.

## Known Issues

- performance: this isn't intended to be a solution for commercial use.  It is a quick and dirty http based solution for mirroring a desktop.
- security: obviously this is a bit of a security hole on whatever desktop you run this on.  It will be available to anyone who stumbled on the URL
- reliability: tunnels are often flaky on a slow link.  "Beware".
- complexity: tunnels can be a bit complicated.  
- rotation: the rotation of the image may vary depending on the desktop system.  You may need to edit the template to chage the rotation.
- https: Snap Specs don't support a whitelist for inesecure hosts.  
- Webview layout is strange ... need to work on the width and scale
- The screenshot that is  taken is different on Linux vs Mac.  The mac will always overwrite its screengrabs.  linux will generate new unique files.  Both are problematic in different ways.  
- The Windows screenshot isn't implemented yet.
- Browser "chrome": ideally the input to the tunnel URL has a GUI input that is possible, though it might be hard to type in.  I'd like to be able to reposition the browser.  I need to put it in a component view.
- UI Input would be really cool
- Need a way to add N tunnels, so you can view multiple sources
- Note: this is a total hack.  It's understood the inefficiency.  The next versions will move to RTSP, under development.  RTSP adds some complexity for set up, but there is a good way to stream via the browser which is seen to work in the Snap WebView. 
- Security implications: ultimiately something like VNC has a good answer for securing the screen.  A good alternative is to use VNC viewer.

## Troubleshooting

Please file bugs.  I welcome pull requests.

## Support

Please support open source.  Donate: $ETH/$POLY: 0x00000001.zil , or $SOL: truedat101.sol ... proceeds make it possible to just do open source!

Any donations will get sponsorship mentions here.  Current sponsors are:

- Razortooth Communications, LLC:  https://razortooth.biz
- IoTone Japan https://iotoneai.site
