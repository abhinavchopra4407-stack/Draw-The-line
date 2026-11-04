package com.ball_game2

import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.SoundPool
import android.os.SystemClock
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.ConcurrentHashMap

class RampAudioModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private var soundPool: SoundPool? = null
    private var mediaPlayer: MediaPlayer? = null
    private val soundMap = ConcurrentHashMap<String, Int>()
    private val lastPlayTimeMap = ConcurrentHashMap<String, Long>()

    private var sfxEnabled = true
    private var musicEnabled = true
    private var sfxVolume = 1.0f
    private var musicVolume = 0.25f
    private var isMusicPlaying = false

    override fun getName(): String = "RampAudioModule"

    override fun initialize() {
        super.initialize()
        reactContext.addLifecycleEventListener(this)
        initSoundPool()
        initMediaPlayer()
    }

    private fun initSoundPool() {
        try {
            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

            soundPool = SoundPool.Builder()
                .setMaxStreams(10)
                .setAudioAttributes(audioAttributes)
                .build()

            val soundResources = mapOf(
                "btn_click" to R.raw.btn_click,
                "draw_ramp" to R.raw.draw_ramp,
                "car_engine" to R.raw.car_engine,
                "car_drive" to R.raw.car_drive,
                "wheel_ramp" to R.raw.wheel_ramp,
                "obstacle_hit" to R.raw.obstacle_hit,
                "car_fail" to R.raw.car_fail,
                "level_win" to R.raw.level_win,
                "coin_collect" to R.raw.coin_collect,
                "next_level" to R.raw.next_level,
                "powerup_collect" to R.raw.powerup_collect,
                "magnet_pull" to R.raw.magnet_pull,
                "shield_break" to R.raw.shield_break,
                "speed_boost" to R.raw.speed_boost,
                "daily_reward" to R.raw.daily_reward,
                "achievement_unlock" to R.raw.achievement_unlock
            )

            for ((name, resId) in soundResources) {
                soundPool?.let { pool ->
                    val soundId = pool.load(reactContext, resId, 1)
                    soundMap[name] = soundId
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun initMediaPlayer() {
        try {
            mediaPlayer = MediaPlayer.create(reactContext, R.raw.bg_music)?.apply {
                isLooping = true
                setVolume(musicVolume, musicVolume)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun playSfx(name: String, volume: Double = 1.0) {
        if (!sfxEnabled) return

        val soundId = soundMap[name] ?: return
        val pool = soundPool ?: return

        // Throttle rapid sounds (e.g. button click or draw ramp spam)
        val now = SystemClock.uptimeMillis()
        val minInterval = when (name) {
            "draw_ramp" -> 70L
            "btn_click" -> 50L
            "wheel_ramp" -> 80L
            else -> 40L
        }
        val lastTime = lastPlayTimeMap[name] ?: 0L
        if (now - lastTime < minInterval) {
            return
        }
        lastPlayTimeMap[name] = now

        val finalVol = (volume.toFloat() * sfxVolume).coerceIn(0.0f, 1.0f)
        try {
            pool.play(soundId, finalVol, finalVol, 1, 0, 1.0f)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun startMusic() {
        isMusicPlaying = true
        if (!musicEnabled) return

        try {
            if (mediaPlayer == null) {
                initMediaPlayer()
            }
            mediaPlayer?.let { player ->
                if (!player.isPlaying) {
                    player.setVolume(musicVolume, musicVolume)
                    player.start()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun pauseMusic() {
        try {
            mediaPlayer?.let { player ->
                if (player.isPlaying) {
                    player.pause()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun resumeMusic() {
        if (isMusicPlaying && musicEnabled) {
            try {
                mediaPlayer?.let { player ->
                    if (!player.isPlaying) {
                        player.setVolume(musicVolume, musicVolume)
                        player.start()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @ReactMethod
    fun stopMusic() {
        isMusicPlaying = false
        try {
            mediaPlayer?.let { player ->
                if (player.isPlaying) {
                    player.pause()
                    player.seekTo(0)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun setMusicEnabled(enabled: Boolean) {
        musicEnabled = enabled
        if (!musicEnabled) {
            pauseMusic()
        } else if (isMusicPlaying) {
            resumeMusic()
        }
    }

    @ReactMethod
    fun setSfxEnabled(enabled: Boolean) {
        sfxEnabled = enabled
    }

    @ReactMethod
    fun setMusicVolume(volume: Double) {
        musicVolume = volume.toFloat().coerceIn(0.0f, 1.0f)
        try {
            mediaPlayer?.setVolume(musicVolume, musicVolume)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun setSfxVolume(volume: Double) {
        sfxVolume = volume.toFloat().coerceIn(0.0f, 1.0f)
    }

    // LifecycleEventListener implementation to handle app background/foreground
    override fun onHostResume() {
        if (isMusicPlaying && musicEnabled) {
            try {
                mediaPlayer?.let { player ->
                    if (!player.isPlaying) {
                        player.setVolume(musicVolume, musicVolume)
                        player.start()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onHostPause() {
        try {
            mediaPlayer?.let { player ->
                if (player.isPlaying) {
                    player.pause()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onHostDestroy() {
        try {
            mediaPlayer?.let { player ->
                if (player.isPlaying) {
                    player.stop()
                }
                player.release()
            }
            mediaPlayer = null

            soundPool?.release()
            soundPool = null
            soundMap.clear()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

