require("LensStudio:TextInputModule")

import Event from "SpectaclesInteractionKit/Utils/Event"
import {Interactable} from "../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import NativeLogger from "../SpectaclesInteractionKit/Utils/NativeLogger"
import TouchHandler from "./modules/behavior/TouchHandler"

const tag = "WebView"
const log = new NativeLogger(tag)

export type WebViewUrlNavigationEvent = {
  url: string
}

@component
export class WebView extends BaseScriptComponent {
  private remoteServiceModule: RemoteServiceModule = requireAsset(
    "Web.remoteServiceModule"
  ) as RemoteServiceModule

  webViewPlanePrefab: ObjectPrefab = requireAsset(
    "./Prefabs/WebPlane.prefab"
  ) as ObjectPrefab
  @ui.group_start("WebView")
  @input
  url: string = "https://snapchat.com"

  @input(undefined, "{1280, 720}")
  @label("Resolution")
  resolution: vec2

  @input
  userAgent: string

  @input
  @label(
    "Enable additional direct touch interactions on WebView (like a touchscreen)"
  )
  poke: boolean = true
  @ui.group_end

  // reference to the plane rendering the webview
  private webViewPlaneObject!: SceneObject
  private webviewImageComponent: Image

  private webViewPlaneTransform: Transform
  private webViewPlaneCollider: ColliderComponent

  private transform: Transform = this.sceneObject.getTransform()
  private webviewControl: WebPageTextureProvider
  private webviewTexture: Texture
  private _isReady: boolean
  private touchHandler: TouchHandler

  private webViewInitializedEvent = new Event<WebView>()
  onWebViewInitialized = this.webViewInitializedEvent.publicApi()

  get isReady(): boolean {
    return this._isReady
  }

  onAwake() {
    // instantiate webplane prefab
    this.webViewPlaneObject = this.webViewPlanePrefab.instantiate(
      this.sceneObject
    )
    this.webViewPlaneTransform = this.webViewPlaneObject.getTransform()
    this.webviewImageComponent = this.webViewPlaneObject.getComponent("Image")

    this.setRenderOrder(0)

    const transformCache = this.transform.getLocalScale()
    this.transform.setLocalScale(vec3.one())
    this.webViewPlaneTransform.setLocalScale(transformCache)

    this.webViewPlaneCollider = this.webViewPlaneObject.getComponent(
      "Physics.ColliderComponent"
    )

    // Initialize WebView
    if (
      global.deviceInfoSystem.isSpectacles() &&
      !global.deviceInfoSystem.isEditor()
    ) {
      const options = RemoteServiceModule.createWebViewOptions(this.resolution)

      try {
        this.remoteServiceModule.createWebView(
          options,
          this.onWebViewCreated.bind(this),
          this.onWebViewCreationError.bind(this)
        )
      } catch (e) {
        print(`createWebView Exception: ${e.toString()}`)
      }
    } else {
      log.d(`WebView requires launching on Spectacles.`)
    }
  }

  private onWebViewCreated(texture: Texture) {
    this.webviewControl = texture.control as WebPageTextureProvider
    this.webviewTexture = texture

    // Clone material and set web page texture
    const imgComponent = this.webViewPlaneObject.getComponent("Component.Image")
    imgComponent.mainMaterial = imgComponent.mainMaterial.clone()
    imgComponent.mainPass.baseTex = texture

    // The underlying component is not ready immediately. Wait for the onReady callback
    this.webviewControl.onReady.add(() => {
      this._isReady = true
      print("WebView is ready")
      const interactable: Interactable =
        this.webViewPlaneObject.createComponent(Interactable.getTypeName())
      interactable.isScrollable = true
      this.touchHandler = new TouchHandler({
        planeCollider: this.webViewPlaneCollider,
        screenSize: this.resolution,
        interactable: interactable,
        usePoke: this.poke,
        webView: this,
      })
      if (this.userAgent !== undefined) {
        this.setUserAgent(this.userAgent)
      }

      if (this.url !== undefined && this.url !== "") {
        this.loadURL(this.url)
      }

      this.webViewInitializedEvent.invoke(this)
    })
  }

  private onWebViewCreationError(msg: string) {
    print(`Error creating webview: ${msg}`)
  }

  public goToUrl(url: string) {
    this.url = url
    this.loadURL(this.url)
  }

  private isValidUrl(url: string): boolean {
    return url !== null && url !== "" && url !== "about:blank"
  }

  private checkWebViewReady() {
    if (!this.webviewControl || !this.isReady) {
      throw new Error("WebView is not ready")
    }
  }

  // load URL
  loadURL(url: string): void {
    this.checkWebViewReady()
    if (this.isValidUrl(url)) {
      this.webviewControl.loadUrl(url)
    } else {
      throw new Error("Unsupported URL")
    }
  }

  // send touch interactions
  touch(x: number, y: number, state: TouchState) {
    this.checkWebViewReady()
    this.webviewControl.touch(0, state, x, y)
  }

  // navigate forward in web history
  forward() {
    this.checkWebViewReady()
    this.webviewControl.goForward()
  }

  // navigate back in web history
  back() {
    this.checkWebViewReady()
    this.webviewControl.goBack()
  }

  // refresh current page
  reload() {
    this.checkWebViewReady()
    this.webviewControl.reload()
  }

  // stop all the downloading
  stop() {
    this.checkWebViewReady()
    this.webviewControl.stop()
  }

  // set a custom user agent
  // used to indicate current device to web server
  setUserAgent(userAgent: string) {
    this.checkWebViewReady()
    this.webviewControl.setUserAgent(userAgent)
  }

  getUserAgent(): string {
    this.checkWebViewReady()
    return this.webviewControl.getUserAgent()
  }

  setRenderOrder(newRenderOrder: number) {
    this.webviewImageComponent.setRenderOrder(newRenderOrder)
  }
}
