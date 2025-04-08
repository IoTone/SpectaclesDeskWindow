import {Interactable} from "../../../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {Interactor} from "../../../SpectaclesInteractionKit/Core/Interactor/Interactor"
import {InteractorEvent} from "../../../SpectaclesInteractionKit/Core/Interactor/InteractorEvent"
import TrackedHand from "../../../SpectaclesInteractionKit/Providers/HandInputData/TrackedHand"
import {SIK} from "../../../SpectaclesInteractionKit/SIK"
import {setTimeout} from "../../../SpectaclesInteractionKit/Utils/FunctionTimingUtils"

import NativeLogger from "../../../SpectaclesInteractionKit/Utils/NativeLogger"
import {findSceneObjectByName} from "../../../SpectaclesInteractionKit/Utils/SceneObjectUtils"
import {WebView} from "../../WebView"
import {PokeVisualHandler} from "./PokeVisualHandler"

const TAG = "TouchHandler"
const log = new NativeLogger(TAG)

type TouchHandlerOptions = {
  planeCollider: ColliderComponent
  screenSize: vec2
  interactable: Interactable
  usePoke: boolean
  webView: WebView
}

/*
 * a time buffer in ms to detect if a touch is a tap or a drag
 * if less than buffer, we call it a tap
 */
const MAX_TOUCH_BUFFER = 200

/**
 * poke boundary
 */

const POKE_BOUNDARY_FRONT = 15
const POKE_BOUNDARY_BACK = -5

/**
 * number of seconds for finger fade
 */
const FINGER_FADE_DURATION = 0.2

const msToNs = function (ms: number): number {
  return ms * 1000 * 1000
}

// getTime return seconds, convert to milliseconds
const getTimeMs = (): number => {
  return getTime() * 1000
}

/**
 *
 * TouchHandler is class that handles input positions from an interactable
 * and formats them and sends them to webview
 *
 */

export default class TouchHandler {
  private currentTouchPoint: vec3 = vec3.zero()
  private startTouchPoint: vec3 = vec3.zero()
  private currentDrag: vec3 = vec3.zero()
  private dragSum: vec3 = vec3.zero()

  private touchStartTime: number = 0
  private touchIndex: number = 0

  private usePoke: boolean = this.options.usePoke

  private isPinching: boolean = false
  private startingPinch: boolean = false
  private lastPinch: boolean = false
  private isHover: boolean = false
  private isPoke: boolean = false

  private webViewPlaneCollider = this.options.planeCollider
  private planeTransform = this.webViewPlaneCollider.getSceneObject().getTransform()
  private screenSize = this.options.screenSize
  private interactable: Interactable = this.options.interactable
  private interactor: Interactor | null = null
  private lastInteractor: Interactor | null = null

  private fingerVisualPrefab = requireAsset("../../Prefabs/FingerVisual.prefab") as ObjectPrefab
  private rightFingerVisual: SceneObject
  private leftFingerVisual: SceneObject

  private rightHand: TrackedHand

  private leftHand: TrackedHand

  private rightHandInRange: boolean = false
  private rightHandInRangeLastFrame: boolean = false
  private rightFingerVisualHandler: PokeVisualHandler
  private leftHandInRange: boolean = false
  private leftHandInRangeLastFrame: boolean = false
  private leftFingerVisualHandler: PokeVisualHandler

  // used to record replay data
  private logTouchData = false

  constructor(private options: TouchHandlerOptions) {
    if (this.usePoke) {
      this.setupPokeVisual()
    }

    this.interactable.onHoverEnter(() => {
      this.isHover = true
    })

    this.interactable.onHoverExit(() => {
      this.isHover = false
    })

    this.interactable.onTriggerStart((event: InteractorEvent) => {
      event.stopPropagation()
      this.startingPinch = true
      this.interactor = event.interactor
      if (this.interactor.targetHitInfo) {
        this.currentTouchPoint = this.planeTransform
          .getInvertedWorldTransform()
          .multiplyPoint(this.interactor.targetHitInfo.hit.position)
      }
    })

    this.interactable.onTriggerEnd(() => {
      this.isPinching = false
      if (this.interactor) this.lastInteractor = this.interactor
      this.interactor = null
    })

    this.interactable.onTriggerCanceled(() => {
      this.isPinching = false
      if (this.interactor) this.lastInteractor = this.interactor
      this.interactor = null
    })

    this.interactable.onHoverUpdate((event: InteractorEvent) => {
      if (event.interactor.targetHitInfo) {
        this.currentTouchPoint = this.planeTransform
          .getInvertedWorldTransform()
          .multiplyPoint(event.interactor.targetHitInfo.hit.position)
      }
    })

    this.rightHand = SIK.HandInputData.getHand("right")
    this.leftHand = SIK.HandInputData.getHand("left")

    const updateEvent: SceneEvent = options.webView.createEvent("UpdateEvent")
    updateEvent.bind(this.update)
  }

  private setupPokeVisual = (): void => {
    const rightFingerInScene = findSceneObjectByName(null, "RightHandWebViewPokeVisual")
    const leftFingerInScene = findSceneObjectByName(null, "LeftHandWebViewPokeVisual")

    if (rightFingerInScene !== null) {
      this.rightFingerVisual = rightFingerInScene
      this.leftFingerVisual = leftFingerInScene
      this.rightFingerVisualHandler = this.rightFingerVisual.getComponent(PokeVisualHandler.getTypeName())
      this.leftFingerVisualHandler = this.leftFingerVisual.getComponent(PokeVisualHandler.getTypeName())
    } else {
      this.rightFingerVisual = this.fingerVisualPrefab.instantiate(null)
      this.rightFingerVisual.name = "RightHandWebViewPokeVisual"
      this.rightFingerVisualHandler = this.rightFingerVisual.getComponent(PokeVisualHandler.getTypeName())
      this.rightFingerVisualHandler.handName = "right"
      this.rightFingerVisualHandler.initialize()
      this.leftFingerVisual = this.fingerVisualPrefab.instantiate(null)
      this.leftFingerVisual.name = "LeftHandWebViewPokeVisual"
      this.leftFingerVisualHandler = this.leftFingerVisual.getComponent(PokeVisualHandler.getTypeName())
      this.leftFingerVisualHandler.handName = "left"
      this.leftFingerVisualHandler.initialize()
    }
  }

  private checkPokeState = (): void => {
    const rightHandPlanePosition = this.planeTransform
      .getInvertedWorldTransform()
      .multiplyPoint(this.rightHand.indexTip.position)

    if (
      rightHandPlanePosition.z < POKE_BOUNDARY_FRONT &&
      rightHandPlanePosition.z > POKE_BOUNDARY_BACK &&
      rightHandPlanePosition.x < 0.5 &&
      rightHandPlanePosition.x > -0.5 &&
      rightHandPlanePosition.y < 0.5 &&
      rightHandPlanePosition.y > -0.5
    ) {
      this.rightHandInRange = true
    } else {
      this.rightHandInRange = false
    }

    if (this.rightHandInRange && !this.rightHandInRangeLastFrame) {
      this.rightFingerVisualHandler.addRequest()
      this.rightHandInRangeLastFrame = true
    }

    if (!this.rightHandInRange && this.rightHandInRangeLastFrame) {
      this.rightFingerVisualHandler.removeRequest()
      this.rightHandInRangeLastFrame = false
    }

    const leftHandPlanePosition = this.planeTransform
      .getInvertedWorldTransform()
      .multiplyPoint(this.leftHand.indexTip.position)

    if (
      leftHandPlanePosition.z < POKE_BOUNDARY_FRONT &&
      leftHandPlanePosition.z > POKE_BOUNDARY_BACK &&
      leftHandPlanePosition.x < 0.5 &&
      leftHandPlanePosition.x > -0.5 &&
      leftHandPlanePosition.y < 0.5 &&
      leftHandPlanePosition.y > -0.5
    ) {
      this.leftHandInRange = true
    } else {
      this.leftHandInRange = false
    }

    if (this.leftHandInRange && !this.leftHandInRangeLastFrame) {
      this.leftFingerVisualHandler.addRequest()
      this.leftHandInRangeLastFrame = true
    }

    if (!this.leftHandInRange && this.leftHandInRangeLastFrame) {
      this.leftFingerVisualHandler.removeRequest()
      this.leftHandInRangeLastFrame = false
    }

    if (this.leftHandInRange || this.rightHandInRange) {
      if (!this.isPoke) {
        this.isPoke = true
        this.interactable.targetingMode = 4
      }
    } else {
      if (this.isPoke) {
        this.isPoke = false
        this.interactable.targetingMode = 3
      }
    }
  }

  private handlePoke = (): void => {
    if (this.interactor?.currentDragVector) {
      // drag multiplier, raw drag values feel to extreme, so dampened by a factor
      const dragMult = 1
      this.currentDrag = this.interactor.currentDragVector
      this.currentDrag = this.planeTransform.getInvertedWorldTransform().multiplyDirection(this.currentDrag)
      this.currentDrag = this.currentDrag.uniformScale(dragMult)
      this.dragSum.x += this.currentDrag.x
      this.dragSum.y += this.currentDrag.y
    }
    if (this.startingPinch && !this.isPinching) {
      // start pinch on web plane
      this.isPinching = true
      if (this.interactor?.inputType === 1) {
        this.leftFingerVisualHandler.material.mainPass.trigger = 1
      } else if (this.interactor?.inputType === 2) {
        this.rightFingerVisualHandler.material.mainPass.trigger = 1
      }
      this.lastPinch = true
      this.startingPinch = false
      this.touchStartTime = msToNs(Date.now())
      this.startTouchPoint = this.currentTouchPoint
      this.touchHandler(TouchState.Began, this.currentTouchPoint.x, this.currentTouchPoint.y)
    } else if (this.isPinching && this.lastPinch) {
      // continue pinch on webplane
      this.touchHandler(
        TouchState.Moved,
        this.startTouchPoint.x + this.dragSum.x,
        this.startTouchPoint.y + this.dragSum.y
      )
      this.currentTouchPoint = this.startTouchPoint.add(this.dragSum)
    } else if (!this.isPinching && !this.lastPinch) {
      this.dragSum.x = 0
      this.dragSum.y = 0
    } else if (!this.isPinching && this.lastPinch) {
      // if was pinching and no longer, release pinch and send end touch just in case
      this.lastPinch = false

      if (this.lastInteractor?.inputType === 1) {
        this.leftFingerVisualHandler.material.mainPass.trigger = 0
      } else if (this.lastInteractor?.inputType === 2) {
        this.rightFingerVisualHandler.material.mainPass.trigger = 0
      }

      const wasSmallMovement = this.startTouchPoint.distance(this.currentTouchPoint) < 0.15

      if (wasSmallMovement) {
        const nowInNano = msToNs(Date.now())
        this.touchHandler(TouchState.Cancelled, this.currentTouchPoint.x, this.currentTouchPoint.y)
        this.touchHandler(TouchState.Began, this.startTouchPoint.x, this.startTouchPoint.y, nowInNano)
        setTimeout(() => {
          this.touchHandler(TouchState.Ended, this.startTouchPoint.x, this.startTouchPoint.y, nowInNano + 300000)
        }, 33)
      } else {
        this.touchHandler(TouchState.Ended, this.currentTouchPoint.x, this.currentTouchPoint.y)
      }
    }
  }

  private handlePinch = (): void => {
    if (this.interactor?.currentDragVector && this.isPinching) {
      // drag multiplier, raw drag values feel to extreme, so dampened by a factor
      const dragMult = 1
      this.currentDrag = this.interactor.currentDragVector
      if (this.currentDrag.lengthSquared > 0.01) {
        this.currentDrag = this.planeTransform.getInvertedWorldTransform().multiplyDirection(this.currentDrag)
        this.currentDrag = this.currentDrag.uniformScale(dragMult)
        this.dragSum.x += this.currentDrag.x
        this.dragSum.y += this.currentDrag.y
      }
    }
    if (this.startingPinch && !this.isPinching) {
      // start pinch on web plane
      this.isPinching = true
      this.lastPinch = true
      this.startingPinch = false
      this.touchStartTime = getTimeMs()
      this.startTouchPoint = this.currentTouchPoint
      this.touchHandler(TouchState.Began, this.currentTouchPoint.x, this.currentTouchPoint.y)
    } else if (this.isPinching && this.lastPinch) {
      // continue pinch on webplane
      const nowInMs = getTimeMs()
      if (nowInMs - this.touchStartTime > MAX_TOUCH_BUFFER || Math.abs(this.dragSum.y) > 0.003) {
        this.touchHandler(
          TouchState.Moved,
          this.startTouchPoint.x + this.dragSum.x,
          this.startTouchPoint.y + this.dragSum.y
        )
      } else {
        this.touchHandler(TouchState.Moved, this.startTouchPoint.x, this.startTouchPoint.y)
      }
    } else if (!this.isPinching && !this.lastPinch) {
      // not pinching and wasn't pinching, just hovering (also check if hovering on webview)
      if (this.isHover) {
        this.touchHandler(TouchState.Moved, this.currentTouchPoint.x, this.currentTouchPoint.y)
      }
    } else if (!this.isPinching && this.lastPinch) {
      // if was pinching and no longer, release pinch and send end touch just in case
      this.dragSum.x = 0
      this.dragSum.y = 0
      this.lastPinch = false
      const nowInMs = getTimeMs()
      let thisPoint: vec3 =
        nowInMs - this.touchStartTime < MAX_TOUCH_BUFFER ? this.startTouchPoint : this.currentTouchPoint

      this.touchHandler(TouchState.Ended, thisPoint.x, thisPoint.y)
      this.touchIndex++
    }
  }

  private update = (): void => {
    if (this.usePoke) {
      this.checkPokeState()
    }

    if (this.isPoke) {
      this.handlePoke()
    } else {
      this.handlePinch()
    }
  }

  /*
   *
   * This function creates touch events to send to the WebView
   * state is the TouchState of the action (start, stop, etc)
   * x is x position on plane
   * y is y position on plane
   */
  private touchHandler = (state: TouchState, x: number, y: number, time?: number): void => {
    x += 0.5
    y -= 0.5
    y *= -1
    x *= this.screenSize.x
    y *= this.screenSize.y

    this.options.webView.touch(x, y, state)
  }
}
