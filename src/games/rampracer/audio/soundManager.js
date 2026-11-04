/**
 * Ramp Racer Sound Manager
 * Provides native sound effects via Android SoundPool and background music via MediaPlayer,
 * with safe fallbacks and Jest test compatibility.
 */
import { NativeModules, AppState } from 'react-native';
const { RampAudioModule } = NativeModules;
class SoundManager {
  sfxEnabled = true;
  musicEnabled = true;
  isMusicPlaying = false;
  appStateSubscription = null;
  constructor() {
    this.setupAppStateListener();
  }
  setupAppStateListener() {
    if (AppState && typeof AppState.addEventListener === 'function') {
      try {
        this.appStateSubscription = AppState.addEventListener(
          'change',
          (nextAppState) => {
            if (nextAppState === 'active') {
              if (this.isMusicPlaying && this.musicEnabled) {
                this.resumeMusic();
              }
            } else if (
              nextAppState === 'background' ||
              nextAppState === 'inactive'
            ) {
              this.pauseMusic();
            }
          }
        );
      } catch {
        // Safe fallback in test environments
      }
    }
  }
  /**
   * Initializes sound preferences from storage.
   */
  init(sfxEnabled = true, musicEnabled = true) {
    this.sfxEnabled = sfxEnabled;
    this.musicEnabled = musicEnabled;
    if (RampAudioModule) {
      RampAudioModule.setSfxEnabled(sfxEnabled);
      RampAudioModule.setMusicEnabled(musicEnabled);
    }
  }
  /**
   * Plays a one-shot sound effect.
   */
  playSfx(name, volume = 1.0) {
    if (!this.sfxEnabled) return;
    if (RampAudioModule && typeof RampAudioModule.playSfx === 'function') {
      try {
        RampAudioModule.playSfx(name, volume);
      } catch {
        // Safe fallback
      }
    }
  }
  /**
   * Starts background music.
   */
  startMusic() {
    this.isMusicPlaying = true;
    if (!this.musicEnabled) return;
    if (RampAudioModule && typeof RampAudioModule.startMusic === 'function') {
      try {
        RampAudioModule.startMusic();
      } catch {
        // Safe fallback
      }
    }
  }
  /**
   * Pauses background music.
   */
  pauseMusic() {
    if (RampAudioModule && typeof RampAudioModule.pauseMusic === 'function') {
      try {
        RampAudioModule.pauseMusic();
      } catch {
        // Safe fallback
      }
    }
  }
  /**
   * Resumes background music.
   */
  resumeMusic() {
    if (this.isMusicPlaying && this.musicEnabled) {
      if (
        RampAudioModule &&
        typeof RampAudioModule.resumeMusic === 'function'
      ) {
        try {
          RampAudioModule.resumeMusic();
        } catch {
          // Safe fallback
        }
      }
    }
  }
  /**
   * Stops background music.
   */
  stopMusic() {
    this.isMusicPlaying = false;
    if (RampAudioModule && typeof RampAudioModule.stopMusic === 'function') {
      try {
        RampAudioModule.stopMusic();
      } catch {
        // Safe fallback
      }
    }
  }
  /**
   * Toggles sound effects ON / OFF.
   */
  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
    if (
      RampAudioModule &&
      typeof RampAudioModule.setSfxEnabled === 'function'
    ) {
      try {
        RampAudioModule.setSfxEnabled(enabled);
      } catch {
        // Safe fallback
      }
    }
  }
  /**
   * Toggles background music ON / OFF.
   */
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (
      RampAudioModule &&
      typeof RampAudioModule.setMusicEnabled === 'function'
    ) {
      try {
        RampAudioModule.setMusicEnabled(enabled);
      } catch {
        // Safe fallback
      }
    }
    if (!enabled) {
      this.pauseMusic();
    } else if (this.isMusicPlaying) {
      this.resumeMusic();
    }
  }
  isSfxEnabled() {
    return this.sfxEnabled;
  }
  isMusicEnabled() {
    return this.musicEnabled;
  }
  cleanup() {
    if (
      this.appStateSubscription &&
      typeof this.appStateSubscription.remove === 'function'
    ) {
      this.appStateSubscription.remove();
    }
    this.stopMusic();
  }
}
export const soundManager = new SoundManager();
