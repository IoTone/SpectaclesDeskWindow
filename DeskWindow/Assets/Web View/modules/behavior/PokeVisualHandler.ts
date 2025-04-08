import {InteractorCursor} from "../../../SpectaclesInteractionKit/Components/Interaction/InteractorCursor/InteractorCursor"
import {InteractorInputType} from "../../../SpectaclesInteractionKit/Core/Interactor/Interactor"
import {HandType} from "../../../SpectaclesInteractionKit/Providers/HandInputData/HandType"
import TrackedHand from "../../../SpectaclesInteractionKit/Providers/HandInputData/TrackedHand"
import {SIK} from "../../../SpectaclesInteractionKit/SIK"
import animate, {
  AnimationManager,
  CancelSet,
} from "../../../SpectaclesInteractionKit/Utils/animate"
import NativeLogger from "../../../SpectaclesInteractionKit/Utils/NativeLogger"

const log = new NativeLogger("PokeVisualHandler")

/**
 * number of seconds for finger fade
 */
const FINGER_FADE_DURATION = 0.2
const MAX_ALPHA = 0.8

/**
 * A component for handling poke visuals for webviews
 * Handles a total count for request to show visuals
 * So if multiple webviews are in the scene they can vote for whether or not the webview poke visual should be shown
 * if 0 votes: hide
 * if more than 0: show
 */
@component
export class PokeVisualHandler extends BaseScriptComponent {
  private _handName: HandType = "right"
  private requests: number = 0

  private visible: boolean = false

  private rmv: RenderMeshVisual
  material: Material
  private transform: Transform
  private hand: TrackedHand
  private cursor: InteractorCursor

  private cancelSet: CancelSet = new CancelSet()

  private animationManager: AnimationManager = AnimationManager.getInstance()

  onAwake() {
    this.rmv = this.sceneObject.getChild(0).getComponent("RenderMeshVisual")
    this.material = this.rmv.mainMaterial.clone()
    this.rmv.mainMaterial = this.material

    this.transform = this.getTransform()
    this.initialize()
  }

  initialize = (): void => {
    this.hand = SIK.HandInputData.getHand(this.handName)
    this.cursor =
      this.handName === "right"
        ? SIK.CursorController.getCursorByInputType(
            InteractorInputType.RightHand
          )
        : SIK.CursorController.getCursorByInputType(
            InteractorInputType.LeftHand
          )
    this.animationManager.requestAnimationFrame(() => {
      this.update()
    })
    this.hideVisual()
  }

  set handName(hand: HandType) {
    this._handName = hand
  }

  get handName(): HandType {
    return this._handName
  }

  addRequest = (): void => {
    this.requests += 1
  }

  removeRequest = (): void => {
    this.requests -= 1
    if (this.requests < 0) this.requests = 0
  }

  update = (): void => {
    if (this.visible) {
      this.transform.setWorldPosition(this.hand.indexUpperJoint.position)
      this.transform.setWorldRotation(this.hand.indexUpperJoint.rotation)
    }

    if (!this.visible && this.requests > 0) {
      this.showVisual()
    }
    if (this.visible && this.requests === 0) {
      this.hideVisual()
    }
    this.animationManager.requestAnimationFrame(() => {
      this.update()
    })
  }

  showVisual = (): void => {
    this.sceneObject.enabled = true
    if (this.cancelSet) this.cancelSet.cancel()
    this.visible = true
    this.cursor.enabled = false
    animate({
      cancelSet: this.cancelSet,
      duration:
        (FINGER_FADE_DURATION * (MAX_ALPHA - this.material.mainPass.alpha)) /
        MAX_ALPHA,
      update: (t) => {
        this.material.mainPass.alpha = t * MAX_ALPHA
      },
    })
  }

  hideVisual = (): void => {
    if (this.cancelSet) this.cancelSet.cancel()
    this.visible = false
    this.cursor.enabled = true
    animate({
      cancelSet: this.cancelSet,
      duration:
        (FINGER_FADE_DURATION * this.material.mainPass.alpha) / MAX_ALPHA,
      update: (t) => {
        this.material.mainPass.alpha = 0
      },
      ended: () => {
        this.sceneObject.enabled = false
      },
    })
  }
}
