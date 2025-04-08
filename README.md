# Overview

Spectacles DeskWindow is a spatial desktop mirroring solution.  You can "peek" at what is going on with any desktop.  It is an old trick used over the years to get simple mirroring working on platforms that don't support a full blown mirroring protocol. 

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

TODO

## Run

TODO

## Troubleshooting

Please file bugs.  I welcome pull requests.