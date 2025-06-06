# Overview

Spectacles DeskWindow is a spatial desktop mirroring solution.  You can "peek" at what is going on with any desktop.  It is an old trick used over the years to get simple mirroring working on platforms that don't support a full blown mirroring protocol. This is a first step PoC to show what is possible, and later versions will build up to progressively better approaches.

<img width="620" alt="Image" src="https://github.com/user-attachments/assets/d7eae522-c7a0-41dc-aa85-e1cf3d9fda40" />

Uses:

- Watch your stocks (lol whelp)
- Monitor a running program (a long build) while you go walk the dog
- Watch a silent movie
- Access a desktop only application

Demo: https://youtu.be/sr250zFttos
Demo2: https://youtu.be/Dx2J5Gqqru0
Demo 3: https://youtu.be/9z2MQcporkg

## Hardware Requirements

- 1 Snap Spectacles Gen5
- 1 Mac or Linux system (WINDOWS not supported yet)
- Some way to tunnel so you can serve HTTPS

## Setup

There are two ways to run this stack and two operating modes possible:

Complexity/Performance:
- easy setup/low performance ~1-3fps,non standard
- high performance, complex set up, 15-25fps,standards focused

Operating modes:
- camera streaming (only possible in high performance setup)
- desktop streaming (no UI control, audio possible on high performance setup)

Choose your path


### Easy

- You need to run **dwscv**, see below
- You need a tunnel to allow a secure HTTPS connection (see below)
- You need to get your tunnel URL and put it into the "WebView" component in your scene graph
- After that you can build and run the lens on your Spectacles

### Advanced

- You need to run the **desktreamsvc** setup
- You need a tunnel to allow a secure HTTPS connection (see below)
- You need to get your tunnel URL and put it into the "WebView" component in your scene graph
- After that you can build and run the lens on your Spectacles


## Build

### dwsvc (easy)

On time setup: virtualenv menv && . ./menv/bin/activate && pip install -r requirements.txt

On a mac, if you attempt to run screencapture or things like that from inside of scripts, Terminal or iTerm may pop up and request permissions.  See explanation and how to fix here: https://ladedu.com/how-to-take-a-screenshot-from-mac-terminal-screencapture/

On Linux, it is worth trying to see if weston-screenshooter command works.  If it complains with a "Permission Denied.  Debug Protocol must be enabled", jump over to here to see how to fix it: https://gitlab.freedesktop.org/wayland/weston/-/issues/773 .  Currently dwsvc requires wayland to run, and assumes the weston window manager.

Run: python dwsvc.py

You can check your service running on localhost:5002/camerafeed in a regular browser.

To run on the spectacles, you need to set up a tunnel.  See the next step.

### deskstreamsvc (advanced)

There is a one time setup, really nothing to build unless you decide to build your dependencies from scratch (maybe in a Yocto Linux setup).   Make sure you have Node.js 20 installed.  Using a node installation manager like NVM or N makes the most sense.  The script used to pull dependencies is called:

setup_deps.sh

For linux arm64 systems, it is called setup_deps_aarch64.sh

The directory deskstreamsvc contains different platforms: mac, windows, linux. First thing to do is make sure you have node20 installed.  I use nvm for this, but on linux you might use "n" instead.

Note: on ARM devices you will probably need to modify the setup.  You can hire me if you need help integrating this into your projects :p .  The Linux setup will be Ubuntu centric, however, behind the scenes I will have this running on some other more obscure Linux ARM platforms as well (think wearable devices).

For Windows users: you should install git bash.  This project won't provide powershell or batch scripts.  Don't worry, if you have git, you have git bash.  When running nodejs, ffmpeg or mediamtx, you may need to accept a dialog prompt to allow the programs to use the network.  Allow.

When it comes to FFMPEG, you really need to think about how you install it, or if you build it from scratch, or if you take the GPL version or the LGPL version.  I cannot make those decisions for anyone.  For mac, the recommendation is to install from brew.  On the other platforms, the recommendation is to grab a pre-built binary from here:

https://github.com/BtbN/FFmpeg-Builds/releases

To really understand how and why you will use ffmpeg, you can read more.  You need to read more if you are on Linux.  Other platforms you may be able to get by without reading.  

For Webcam setup: https://trac.ffmpeg.org/wiki/Capture/Webcam

For Desktop Screen Capture, read through my notes here: https://github.com/IoTone/SpectaclesDeskWindow/issues/5#issuecomment-2822642502

Note: the devices, especially USB devices like webcams, can change their mapping between boots.  So you may need to reconfigure your scripts between boots.

The order to run things for camera streaming:

- run mediamtx: ./mediamtx
- run_ffmpeg_camera.sh
- run_rtsprelay.sh
- manually run your tunnel (see below)

The order to run things for desktop streaming:

- run mediamtx: ./mediamtx
- run_ffmpeg_screencapture.sh
- run_rtsprelay.sh
- manually run your tunnel (see below)

In both cases, check out your setup with your browser:

http://localhost:8888
and
http://localhost:9000

### Tunnel

It is recommended to use ngrok as the easiest way to make your tunnel.  There slightly more complex tunnel options possible using SSH, however, these are a bit harder to set up and maybe less stable depending on various factors.

See: https://ngrok.com/docs/getting-started/

The reason this approach is preferred is it is very stable.  The only downside is it is a paid service.  I will document other options in the future.

### No Tunnels

If you choose not to use a Tunnel to get to your desktop, you will need to be on the latest May 2025 release of SnapOS or later, as this is a relatively new feature.  What it means is you can access a webview or remote service without requiring an HTTPS connection.  In theory, you will still need a valid certificate if you choose to use a domain that in on an insecure connection (WebView probably doesn't handle exceptions properly).  But for certain, an IP address will work. This isn't as easy to manage because IP addresses are hard to remember, and may change over time.

A special note for local networks: you will really need to understand your home / office / lab / cafe network if you are using local networking.  The challenges that arise are numerous.  But generally, your Spectacles and your Desk Window server need to be on the same network.  If you aren't sure, this approach is not recommended.  Secondly, if ports are being blocked, it will be up to you to manage exposing ports you may need.  Again, if you aren't sure what this means, you should consider using the tunnel approach.

### DesktopWindow Spectacles Lens

It is easiest if you search in the scene object view and search for WebView.  Edit the component in the property editor and set the URL to your runnel.

Search through the Scene Hierarchy for a component called "DeskViewUI".  Under there there is a WebView entitled: WebView [CHANGE THE URL TO YOUR TUNNEL / RTSP]

You can edit the URL section of this comonent to be:

- for dwsvc: https://MYURLTUNNEL/camerafeed
- for deskstreamsvc: https://MYURLTUNNEL

Unfortunately the setups vary, and your URL for your tunnel might include a port number.  I had some problems with the tunnel if I exposed it on a non-standard port.

### WebView and Component Frame UI

Some general notes, the Container Frame UI has some features which aren't obvious:

- Border is necessary and is the thickness of the area that is like an internal frame between the contained component. Set to 50 seems to be fine. If you make it 100 it's huge, like a super thick picture frame.
- Inner size : says it's the size of the inner content area. Set to 15. Not really sure what it does
- Allow Scaling: if you have this on, it is possible to pinch zoom in/out on the contained contents ... may be a little hard to control
- Min and Max size: says this is the max / min you would like the container resized too. Presumably this is a limit, so you can't overexpand the container


## Run

Launch the DeskWindow Lens.  If you have configured the URLs correctly and tunnel, you can see the video in your browser.

## Known Issues

- performance: this isn't intended to be a solution for commercial use.  It is a quick and dirty http based solution for mirroring a desktop.
- security: obviously this is a bit of a security hole on whatever desktop you run this on.  It will be available to anyone who stumbled on the URL
- reliability: tunnels are often flaky on a slow link.  "Beware".
- complexity: tunnels can be a bit complicated.  
- rotation: the rotation of the image may vary depending on the desktop system.  You may need to edit the template to chage the rotation.
- Webview layout is strange ... need to work on the width and scale
- The screenshot that is  taken is different on Linux vs Mac.  Images may get rotated with dwsvc.
- The Windows screenshot isn't implemented yet.
- Browser "chrome": ideally the input to the tunnel URL has a GUI input that is possible, though it might be hard to type in. 
- UI Input would be really cool
- You may decide you want to turn on the scaling where you can pinch and drag the size of the webview
- Need a way to add N tunnels, so you can view multiple sources
- Note: the dwsvc is a total hack.  It's understood the inefficiency.  If you are unhappy with it, you can take the extra time to look at how to use deskstreamsvc.  RTSP adds some complexity for set up, but there is a good way to stream via the browser which is seen to work in the Snap WebView. 
- Security implications: ultimiately something like VNC has a good answer for securing the screen.  A good alternative is to use VNC viewer.
- Adding audio support ... it would be nice to get the stream of audio off your desktop as well, possible with ffmpeg.

## Troubleshooting

Please file bugs.  I welcome pull requests.

## Support

Please support open source.  Donate: $ETH/$POLY: 0x00000001.zil , or $SOL: truedat101.sol ... proceeds make it possible to just do open source!

Any donations will get sponsorship mentions here.  Current sponsors are:

- Razortooth Communications, LLC:  https://razortooth.biz
- IoTone Japan https://iotoneai.site
