# Overview

Spectacles DeskWindow is a spatial desktop mirroring solution.  You can "peek" at what is going on with any desktop.  It is an old trick used over the years to get simple mirroring working on platforms that don't support a full blown mirroring protocol. This is a first step PoC to show what is possible, and later versions will build up to progressively better approaches.

## Setup

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

## Troubleshooting

Please file bugs.  I welcome pull requests.