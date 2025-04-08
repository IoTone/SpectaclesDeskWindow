import {validate} from "../../Utils/validate"
import {Interactable} from "../Interaction/Interactable/Interactable"
/**
 * This class provides audio feedback for interactable objects. It allows configuration of audio tracks for hover, trigger start, and trigger end events. The class also provides access to the audio component for further customization.
 */
@component
export class InteractableAudioFeedback extends BaseScriptComponent {
  @input
  private _playAudioOnHover: boolean = true
  @input("Asset.AudioTrackAsset")
  @showIf("_playAudioOnHover", true)
  @hint("This sound will play when the Interactable is hovered")
  @allowUndefined
  private _hoverAudioTrack: AudioTrackAsset | undefined

  @input
  private _playAudioOnTriggerStart: boolean = true
  @input("Asset.AudioTrackAsset")
  @showIf("_playAudioOnTriggerStart", true)
  @hint("This sound will play when starting the trigger the Interactable")
  @allowUndefined
  private _triggerStartAudioTrack: AudioTrackAsset | undefined

  @input
  private _playAudioOnTriggerEnd: boolean = true
  @input("Asset.AudioTrackAsset")
  @showIf("_playAudioOnTriggerEnd", true)
  @hint("This sound will play when ending the trigger of the Interactable")
  @allowUndefined
  private _triggerEndAudioTrack: AudioTrackAsset | undefined

  private _hoverAudioComponent: AudioComponent | undefined
  private _triggerStartAudioComponent: AudioComponent | undefined
  private _triggerEndAudioComponent: AudioComponent | undefined
  private interactable: Interactable | null = null

  onAwake(): void {
    this.defineScriptEvents()
  }

  private defineScriptEvents() {
    this.createEvent("OnStartEvent").bind(() => {
      this.init()
    })
  }

  /**
   * Set the AudioTrackAsset to play when the Interactable receives a hover event.
   */
  set hoverAudioTrack(track: AudioTrackAsset) {
    this._hoverAudioTrack = track

    if (this.hoverAudioComponent !== undefined) {
      this.hoverAudioComponent.audioTrack = track
    }
  }

  /**
   * @returns the AudioTrackAsset to play when the Interactable receives a hover event.
   */
  get hoverAudioTrack(): AudioTrackAsset | undefined {
    return this._hoverAudioTrack
  }

  /**
   * Set the AudioTrackAsset to play when the Interactable receives a trigger start event.
   */
  set triggerStartAudioTrack(track: AudioTrackAsset) {
    this._triggerStartAudioTrack = track

    if (this.triggerStartAudioComponent !== undefined) {
      this.triggerStartAudioComponent.audioTrack = track
    }
  }

  /**
   * @returns the AudioTrackAsset to play when the Interactable receives a trigger start event.
   */
  get triggerStartAudioTrack(): AudioTrackAsset | undefined {
    return this._triggerStartAudioTrack
  }

  /**
   * Set the AudioTrackAsset to play when the Interactable receives a trigger end event.
   */
  set triggerEndAudioTrack(track: AudioTrackAsset) {
    this._triggerEndAudioTrack = track

    if (this.triggerEndAudioComponent !== undefined) {
      this.triggerEndAudioComponent.audioTrack = track
    }
  }

  /**
   * @returns the AudioTrackAsset to play when the Interactable receives a trigger end event.
   */
  get triggerEndAudioTrack(): AudioTrackAsset | undefined {
    return this._triggerEndAudioTrack
  }

  /**
   * Set if audio should play when the Interactable receives a hover event.
   */
  set playAudioOnHover(enabled: boolean) {
    this._playAudioOnHover = enabled

    if (this.hoverAudioComponent === undefined) {
      this._hoverAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._hoverAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )

      if (this.hoverAudioTrack === undefined) {
        this.hoverAudioTrack = requireAsset(
          "../../Assets/Audio/HoverAudioTrack.wav",
        ) as AudioTrackAsset
      }
      this._hoverAudioComponent.audioTrack = this.hoverAudioTrack
    }
  }

  /**
   * @returns if audio should play when the Interactable receives a hover event.
   */
  get playAudioOnHover(): boolean {
    return this._playAudioOnHover
  }

  /**
   * Set if audio should play when the Interactable receives a trigger start event.
   */
  set playAudioOnTriggerStart(enabled: boolean) {
    this._playAudioOnTriggerStart = enabled

    if (this.triggerStartAudioComponent === undefined) {
      this._triggerStartAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._triggerStartAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )

      if (this.triggerStartAudioTrack === undefined) {
        this.triggerStartAudioTrack = requireAsset(
          "../../Assets/Audio/TriggerStartAudioTrack.wav",
        ) as AudioTrackAsset
      }
      this.triggerStartAudioComponent.audioTrack = this.triggerStartAudioTrack
    }
  }

  /**
   * @returns if audio should play when the Interactable receives a trigger start event.
   */
  get playAudioOnTriggerStart(): boolean {
    return this._playAudioOnTriggerStart
  }

  /**
   * Set if audio should play when the Interactable receives a trigger end event.
   */
  set playAudioOnTriggerEnd(enabled: boolean) {
    this._playAudioOnTriggerEnd = enabled

    if (this.triggerEndAudioComponent === undefined) {
      this._triggerEndAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._triggerEndAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )

      if (this.triggerEndAudioTrack === undefined) {
        this.triggerEndAudioTrack = requireAsset(
          "../../Assets/Audio/TriggerEndAudioTrack.wav",
        ) as AudioTrackAsset
      }
      this._triggerEndAudioComponent.audioTrack = this.triggerEndAudioTrack
    }
  }

  /**
   * @returns if audio should play when the Interactable receives a trigger end event.
   */
  get playAudioOnTriggerEnd(): boolean {
    return this._playAudioOnTriggerEnd
  }

  /**
   * Returns the AudioComponent used for hover feedback for further configuration (such as volume).
   */
  get hoverAudioComponent(): AudioComponent | undefined {
    return this._hoverAudioComponent
  }

  /**
   * Returns the AudioComponent used for trigger start feedback for further configuration (such as volume).
   */
  get triggerStartAudioComponent(): AudioComponent | undefined {
    return this._triggerStartAudioComponent
  }

  /**
   * Returns the AudioComponent used for trigger end feedback for further configuration (such as volume).
   */
  get triggerEndAudioComponent(): AudioComponent | undefined {
    return this._triggerEndAudioComponent
  }

  private setupInteractableCallbacks() {
    validate(this.interactable)

    this.interactable.onHoverEnter.add(() => {
      try {
        if (this.playAudioOnHover && this._hoverAudioComponent) {
          this._hoverAudioComponent.play(1)
        }
      } catch (e) {
        print("Error playing hover audio: " + e)
      }
    })

    this.interactable.onTriggerStart.add(() => {
      try {
        if (this.playAudioOnTriggerStart && this._triggerStartAudioComponent) {
          this._triggerStartAudioComponent.play(1)
        }
      } catch (e) {
        print("Error playing trigger start audio: " + e)
      }
    })

    this.interactable.onTriggerEnd.add(() => {
      try {
        if (this.playAudioOnTriggerEnd && this._triggerEndAudioComponent) {
          this._triggerEndAudioComponent.play(1)
        }
      } catch (e) {
        print("Error playing trigger end audio: " + e)
      }
    })
  }

  private init() {
    if (this.playAudioOnHover) {
      this._hoverAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._hoverAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )

      if (this.hoverAudioTrack === undefined) {
        this.hoverAudioTrack = requireAsset(
          "../../Assets/Audio/HoverAudioTrack.wav",
        ) as AudioTrackAsset
      }
      this._hoverAudioComponent.audioTrack = this.hoverAudioTrack
    }

    if (this.playAudioOnTriggerStart) {
      this._triggerStartAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._triggerStartAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )

      if (this.triggerStartAudioTrack === undefined) {
        this.triggerStartAudioTrack = requireAsset(
          "../../Assets/Audio/TriggerStartAudioTrack.wav",
        ) as AudioTrackAsset
      }
      this._triggerStartAudioComponent.audioTrack = this.triggerStartAudioTrack
    }

    if (this.playAudioOnTriggerEnd) {
      this._triggerEndAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._triggerEndAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )

      if (this.triggerEndAudioTrack === undefined) {
        this.triggerEndAudioTrack = requireAsset(
          "../../Assets/Audio/TriggerEndAudioTrack.wav",
        ) as AudioTrackAsset
      }
      this._triggerEndAudioComponent.audioTrack = this.triggerEndAudioTrack
    }

    this.interactable = this.getSceneObject().getComponent(
      Interactable.getTypeName(),
    )

    if (!this.interactable) {
      throw new Error(
        "Could not find Interactable component on this SceneObject.",
      )
    }

    this.setupInteractableCallbacks()
  }

  private setPlaybackMode(
    target: AudioComponent,
    playbackMode: Audio.PlaybackMode | undefined,
  ) {
    if (playbackMode !== undefined) {
      target.playbackMode = playbackMode
    }
  }
}
