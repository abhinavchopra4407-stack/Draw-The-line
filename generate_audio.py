import os
import wave
import struct
import math
import random

SAMPLE_RATE = 44100

def write_wav(filename, samples, sample_rate=SAMPLE_RATE):
    out_dir = os.path.join(os.path.dirname(__file__), 'android', 'app', 'src', 'main', 'res', 'raw')
    os.makedirs(out_dir, exist_ok=True)
    filepath = os.path.join(out_dir, filename)
    with wave.open(filepath, 'w') as wav:
        wav.setnchannels(1)  # mono
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(sample_rate)
        
        # Clamp and pack samples
        packed = bytearray()
        for s in samples:
            val = int(max(-32767, min(32767, s * 32767.0)))
            packed.extend(struct.pack('<h', val))
        wav.writeframes(packed)
    print(f"Created {filename}: {len(samples)} samples ({len(samples)/sample_rate:.2f}s)")

# 1. Button Click (crisp bubble pop / wooden tap)
def gen_btn_click():
    duration = 0.05
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 80.0)
        freq = 950.0 - 550.0 * (t / duration)
        s = math.sin(2.0 * math.pi * freq * t) * env
        samples.append(s * 0.75)
    return samples

# 2. Draw Ramp (soft tactile pencil / sketch swish)
def gen_draw_ramp():
    duration = 0.08
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    random.seed(42)
    noise_state = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Hann window envelope
        env = math.sin(math.pi * t / duration)
        # Gentle band-limited friction sound
        raw_noise = (random.random() * 2.0 - 1.0)
        noise_state = 0.7 * noise_state + 0.3 * raw_noise
        tone = math.sin(2.0 * math.pi * 320.0 * t) * 0.25
        s = (noise_state * 0.7 + tone) * env
        samples.append(s * 0.45)
    return samples

# 3. Car Engine Startup (vroom / rev)
def gen_car_engine():
    duration = 0.38
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    phase = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Envelope: punchy start, sustains, tapers
        if t < 0.05:
            env = t / 0.05
        else:
            env = math.exp(-(t - 0.05) * 4.5)
        # Pitch rises from 95Hz to 240Hz
        freq = 95.0 + 145.0 * math.pow(t / duration, 0.7) + 5.0 * math.sin(2.0 * math.pi * 35.0 * t)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        # Sawtooth + harmonics for engine growl
        harmonics = math.sin(phase) + 0.5 * math.sin(2 * phase) + 0.25 * math.sin(3 * phase)
        s = harmonics * env * 0.6
        samples.append(s)
    return samples

# 4. Car Drive (engine cruising hum)
def gen_car_drive():
    duration = 0.25
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    phase = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * t / duration)
        freq = 150.0 + 15.0 * math.sin(2.0 * math.pi * 12.0 * t)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        s = (math.sin(phase) + 0.4 * math.sin(2 * phase)) * env * 0.45
        samples.append(s)
    return samples

# 5. Wheel Ramp (soft rolling traction over wood/concrete)
def gen_wheel_ramp():
    duration = 0.12
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    random.seed(99)
    rumble = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * t / duration)
        n = random.random() * 2.0 - 1.0
        rumble = 0.85 * rumble + 0.15 * n
        hum = math.sin(2.0 * math.pi * 180.0 * t) * 0.3
        s = (rumble * 0.7 + hum) * env * 0.5
        samples.append(s)
    return samples

# 6. Obstacle Hit (cartoon bump / thud)
def gen_obstacle_hit():
    duration = 0.16
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 22.0)
        freq = 280.0 * math.exp(-t * 25.0) + 55.0
        s = math.sin(2.0 * math.pi * freq * t) * env * 0.8
        samples.append(s)
    return samples

# 7. Car Fail (playful descending cartoon slide)
def gen_car_fail():
    duration = 0.48
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    phase = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * t / duration) * math.exp(-t * 2.0)
        freq = 380.0 - 230.0 * (t / duration) + 12.0 * math.sin(2.0 * math.pi * 15.0 * t)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        s = (math.sin(phase) + 0.3 * math.sin(2 * phase)) * env * 0.65
        samples.append(s)
    return samples

# 8. Level Win (joyful celebratory chime fanfare: C5, E5, G5, C6)
def gen_level_win():
    duration = 0.85
    n_samples = int(duration * SAMPLE_RATE)
    samples = [0.0] * n_samples
    notes = [
        (0.00, 523.25, 0.40), # C5
        (0.12, 659.25, 0.40), # E5
        (0.24, 783.99, 0.40), # G5
        (0.38, 1046.50, 0.55), # C6 (accent note)
    ]
    for start_t, freq, note_len in notes:
        start_idx = int(start_t * SAMPLE_RATE)
        note_samples = int(note_len * SAMPLE_RATE)
        for i in range(note_samples):
            idx = start_idx + i
            if idx >= n_samples:
                break
            t = i / SAMPLE_RATE
            env = math.exp(-t * 6.5)
            # Bell/chime harmonics
            bell = math.sin(2.0 * math.pi * freq * t) + 0.4 * math.sin(2.0 * math.pi * freq * 2.0 * t) + 0.15 * math.sin(2.0 * math.pi * freq * 3.0 * t)
            samples[idx] += bell * env * 0.45
    return samples

# 9. Coin Collect (bright sparkling metallic ding)
def gen_coin_collect():
    duration = 0.38
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        if t < 0.08:
            freq = 1318.5 # E6
            env = math.exp(-t * 12.0)
        else:
            t2 = t - 0.08
            freq = 2093.0 # C7
            env = math.exp(-t2 * 8.0)
        # Ringing bell timbre
        bell = math.sin(2.0 * math.pi * freq * t) + 0.35 * math.sin(2.0 * math.pi * freq * 2.0 * t)
        samples.append(bell * env * 0.7)
    return samples

# 10. Next Level (uplifting whoosh + ascending chime)
def gen_next_level():
    duration = 0.45
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * t / duration)
        sweep_freq = 420.0 + 780.0 * math.pow(t / duration, 1.5)
        chime = math.sin(2.0 * math.pi * sweep_freq * t) + 0.3 * math.sin(2.0 * math.pi * (sweep_freq * 1.5) * t)
        samples.append(chime * env * 0.55)
    return samples

# 11. Background Music (cheerful, child-friendly 8-bar looping melody)
# Tempo = 112 BPM, 4 beats per bar, 8 bars = 17.14 seconds
def gen_bg_music():
    bpm = 112.0
    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0
    total_bars = 4
    total_sec = total_bars * bar_sec
    n_samples = int(total_sec * SAMPLE_RATE)
    samples = [0.0] * n_samples

    # Frequencies (C4 octave)
    C3, D3, E3, F3, G3, A3, B3 = 130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94
    C4, D4, E4, F4, G4, A4, B4 = 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88
    C5, D5, E5, F5, G5, A5 = 523.25, 587.33, 659.25, 698.46, 783.99, 880.00

    # Chords per bar: C (I) -> G (V) -> Am (vi) -> F (IV)
    bass_notes = [
        (0 * bar_sec, C3, bar_sec * 0.95),
        (1 * bar_sec, G3, bar_sec * 0.95),
        (2 * bar_sec, A3, bar_sec * 0.95),
        (3 * bar_sec, F3, bar_sec * 0.95),
    ]

    # Warm marimba / music box melody
    # Bar 1: C major (C4 - E4 - G4 - E4)
    # Bar 2: G major (D4 - G4 - B4 - G4)
    # Bar 3: A minor (C5 - A4 - E4 - A4)
    # Bar 4: F major (F4 - A4 - C5 - D5)
    melody_events = [
        # Bar 1
        (0.00 * beat_sec, E4, 0.45 * beat_sec),
        (0.50 * beat_sec, G4, 0.45 * beat_sec),
        (1.00 * beat_sec, C5, 0.85 * beat_sec),
        (2.00 * beat_sec, G4, 0.45 * beat_sec),
        (2.50 * beat_sec, E4, 0.45 * beat_sec),
        (3.00 * beat_sec, G4, 0.85 * beat_sec),
        # Bar 2
        (4.00 * beat_sec, D4, 0.45 * beat_sec),
        (4.50 * beat_sec, G4, 0.45 * beat_sec),
        (5.00 * beat_sec, B4, 0.85 * beat_sec),
        (6.00 * beat_sec, G4, 0.45 * beat_sec),
        (6.50 * beat_sec, D4, 0.45 * beat_sec),
        (7.00 * beat_sec, G4, 0.85 * beat_sec),
        # Bar 3
        (8.00 * beat_sec, E4, 0.45 * beat_sec),
        (8.50 * beat_sec, A4, 0.45 * beat_sec),
        (9.00 * beat_sec, C5, 0.85 * beat_sec),
        (10.0 * beat_sec, A4, 0.45 * beat_sec),
        (10.5 * beat_sec, E4, 0.45 * beat_sec),
        (11.0 * beat_sec, A4, 0.85 * beat_sec),
        # Bar 4
        (12.0 * beat_sec, F4, 0.45 * beat_sec),
        (12.5 * beat_sec, A4, 0.45 * beat_sec),
        (13.0 * beat_sec, C5, 0.85 * beat_sec),
        (14.0 * beat_sec, D5, 0.85 * beat_sec),
        (15.0 * beat_sec, B4, 0.95 * beat_sec),
    ]

    # Synthesize bass (smooth warm triangle-like tone)
    for start_t, freq, dur in bass_notes:
        start_idx = int(start_t * SAMPLE_RATE)
        note_samples = int(dur * SAMPLE_RATE)
        for i in range(note_samples):
            idx = start_idx + i
            if idx >= n_samples:
                break
            t = i / SAMPLE_RATE
            env = math.exp(-t * 1.5)
            # Triangle approximation (odd harmonics)
            tone = math.sin(2 * math.pi * freq * t) + 0.2 * math.sin(2 * math.pi * 3 * freq * t)
            samples[idx] += tone * env * 0.22

    # Synthesize melody (bright marimba / music box)
    for start_t, freq, dur in melody_events:
        start_idx = int(start_t * SAMPLE_RATE)
        note_samples = int(dur * SAMPLE_RATE)
        for i in range(note_samples):
            idx = start_idx + i
            if idx >= n_samples:
                break
            t = i / SAMPLE_RATE
            env = math.exp(-t * 5.0)
            tone = math.sin(2 * math.pi * freq * t) + 0.35 * math.sin(2 * math.pi * 2 * freq * t) + 0.1 * math.sin(2 * math.pi * 3 * freq * t)
            samples[idx] += tone * env * 0.28

    # Light rhythmic pulse (soft wooden click on beats 2 and 4 of each bar)
    for b in range(16):
        if b % 2 == 1:
            pulse_t = b * beat_sec
            start_idx = int(pulse_t * SAMPLE_RATE)
            for i in range(int(0.04 * SAMPLE_RATE)):
                idx = start_idx + i
                if idx >= n_samples:
                    break
                t = i / SAMPLE_RATE
                env = math.exp(-t * 80.0)
                samples[idx] += math.sin(2 * math.pi * 800 * t) * env * 0.08

    # Apply gentle fade-in / fade-out at borders to ensure seamless looping
    fade_len = int(0.02 * SAMPLE_RATE)
    for i in range(fade_len):
        f = i / fade_len
        samples[i] *= f
        samples[n_samples - 1 - i] *= f

    return samples

# 12. Power-Up Collect (bright shimmering arpeggio chime)
def gen_powerup_collect():
    duration = 0.42
    n_samples = int(duration * SAMPLE_RATE)
    samples = [0.0] * n_samples
    notes = [
        (0.00, 784.0, 0.18),   # G5
        (0.08, 987.77, 0.18),  # B5
        (0.16, 1174.66, 0.22), # D6
        (0.24, 1567.98, 0.18), # G6
    ]
    for start_t, freq, dur in notes:
        start_idx = int(start_t * SAMPLE_RATE)
        note_samples = int(dur * SAMPLE_RATE)
        for i in range(note_samples):
            idx = start_idx + i
            if idx >= n_samples:
                break
            t = i / SAMPLE_RATE
            env = math.exp(-t * 12.0)
            tone = math.sin(2.0 * math.pi * freq * t) + 0.4 * math.sin(2.0 * math.pi * (freq * 2) * t)
            samples[idx] += tone * env * 0.42
    return samples

# 13. Magnet Pull (soft pulsing electromagnetic chime)
def gen_magnet_pull():
    duration = 0.22
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * t / duration)
        vibrato = math.sin(2.0 * math.pi * 18.0 * t) * 25.0
        freq = 520.0 + 360.0 * (t / duration) + vibrato
        s = math.sin(2.0 * math.pi * freq * t) * 0.35
        # Soft metallic harmonic
        s += 0.2 * math.sin(2.0 * math.pi * (freq * 2.2) * t)
        samples.append(s * env * 0.45)
    return samples

# 14. Shield Break / Absorb (energy barrier pop and crystal shimmer)
def gen_shield_break():
    duration = 0.35
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    random.seed(99)
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 14.0)
        # Deep energy pop + high crystalline resonance
        pop = math.sin(2.0 * math.pi * (160.0 - 100.0 * (t / duration)) * t) * 0.6
        crystal = (
            math.sin(2.0 * math.pi * 1420.0 * t) * 0.3
            + math.sin(2.0 * math.pi * 2240.0 * t) * 0.2
        )
        spark = (random.random() * 2.0 - 1.0) * 0.15 * math.exp(-t * 25.0)
        s = (pop + crystal + spark) * env
        samples.append(s * 0.5)
    return samples

# 15. Speed Boost (fiery rocket turbo whoosh / jet flare)
def gen_speed_boost():
    duration = 0.48
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    random.seed(77)
    noise_filt = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Swell and decay envelope
        env = math.pow(math.sin(math.pi * t / duration), 1.2)
        # Rising turbo tone
        freq = 320.0 + 580.0 * math.pow(t / duration, 1.8)
        tone = math.sin(2.0 * math.pi * freq * t) * 0.4
        # Roaring flame noise
        raw_noise = random.random() * 2.0 - 1.0
        noise_filt = 0.82 * noise_filt + 0.18 * raw_noise
        s = (tone * 0.55 + noise_filt * 0.45) * env
        samples.append(s * 0.6)
    return samples

# 16. Daily Reward Claim (grand celebratory fanfare & sparkle chime)
def gen_daily_reward():
    duration = 0.75
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    # Fanfare notes: C5 (523), E5 (659), G5 (784), C6 (1046.5), E6 (1318)
    notes = [
        (0.00, 0.12, 523.25),
        (0.10, 0.12, 659.25),
        (0.20, 0.14, 783.99),
        (0.32, 0.18, 1046.50),
        (0.46, 0.28, 1318.51),
    ]
    random.seed(99)
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        s = 0.0
        for start, dur, freq in notes:
            if start <= t < start + dur:
                local_t = t - start
                env = math.sin(math.pi * (local_t / dur)) * math.exp(-local_t * 5.0)
                # Harmonic richness (brass / bright bell)
                tone = (
                    math.sin(2.0 * math.pi * freq * local_t) * 0.55
                    + math.sin(4.0 * math.pi * freq * local_t) * 0.28
                    + math.sin(6.0 * math.pi * freq * local_t) * 0.12
                )
                s += tone * env
        # Sparkle chime tail
        if t > 0.35:
            sparkle_t = t - 0.35
            sparkle_env = math.exp(-sparkle_t * 6.0)
            sparkle = (
                math.sin(2.0 * math.pi * 2093.0 * sparkle_t) * 0.15
                + math.sin(2.0 * math.pi * 3136.0 * sparkle_t) * 0.10
                + (random.random() * 2.0 - 1.0) * 0.04
            ) * sparkle_env
            s += sparkle
        samples.append(s * 0.65)
    return samples

# 17. Achievement Unlock (triumphant brass fanfare & victory arpeggio)
def gen_achievement_unlock():
    duration = 0.85
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    # Triumphant fanfare: D5 (587.33), F#5 (739.99), A5 (880.00), D6 (1174.66)
    notes = [
        (0.00, 0.13, 587.33),
        (0.12, 0.13, 739.99),
        (0.24, 0.16, 880.00),
        (0.38, 0.36, 1174.66),
    ]
    random.seed(101)
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        s = 0.0
        for start, dur, freq in notes:
            if start <= t < start + dur:
                local_t = t - start
                env = math.sin(math.pi * (local_t / dur)) * math.exp(-local_t * 3.5)
                tone = (
                    math.sin(2.0 * math.pi * freq * local_t) * 0.60
                    + math.sin(4.0 * math.pi * freq * local_t) * 0.25
                    + math.sin(6.0 * math.pi * freq * local_t) * 0.10
                )
                s += tone * env
        # Shimmering star sparkle
        if t > 0.42:
            st = t - 0.42
            senv = math.exp(-st * 5.0)
            spark = (
                math.sin(2.0 * math.pi * 2349.32 * st) * 0.18
                + math.sin(2.0 * math.pi * 3520.00 * st) * 0.12
            ) * senv
            s += spark
        samples.append(s * 0.65)
    return samples

def main():
    print("Generating audio assets...")
    write_wav("btn_click.wav", gen_btn_click())
    write_wav("draw_ramp.wav", gen_draw_ramp())
    write_wav("car_engine.wav", gen_car_engine())
    write_wav("car_drive.wav", gen_car_drive())
    write_wav("wheel_ramp.wav", gen_wheel_ramp())
    write_wav("obstacle_hit.wav", gen_obstacle_hit())
    write_wav("car_fail.wav", gen_car_fail())
    write_wav("level_win.wav", gen_level_win())
    write_wav("coin_collect.wav", gen_coin_collect())
    write_wav("next_level.wav", gen_next_level())
    write_wav("bg_music.wav", gen_bg_music())
    write_wav("powerup_collect.wav", gen_powerup_collect())
    write_wav("magnet_pull.wav", gen_magnet_pull())
    write_wav("shield_break.wav", gen_shield_break())
    write_wav("speed_boost.wav", gen_speed_boost())
    write_wav("daily_reward.wav", gen_daily_reward())
    write_wav("achievement_unlock.wav", gen_achievement_unlock())
    print("All audio assets successfully generated!")

if __name__ == "__main__":
    main()

