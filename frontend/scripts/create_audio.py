"""Create original, loopable ambient noise and a gentle demo alarm chime."""
from pathlib import Path
import wave
import numpy as np

target = Path(__file__).resolve().parent.parent / 'assets' / 'audio'
target.mkdir(parents=True, exist_ok=True)
rate = 22050
rng = np.random.default_rng(42)

def write(name, samples):
    samples = np.clip(samples, -1, 1)
    with wave.open(str(target / name), 'wb') as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(rate)
        audio.writeframes((samples * 32767).astype(np.int16).tobytes())

noise = rng.normal(0, 0.18, rate * 12)
rain = np.convolve(noise, np.ones(4) / 4, mode='same')
write('rain.wav', rain)
t = np.arange(rate * 5) / rate
chime = np.zeros_like(t)
for offset, frequency in [(0, 523.25), (0.4, 659.25), (0.8, 783.99), (1.2, 1046.5)]:
    local = np.maximum(t - offset, 0)
    envelope = (t >= offset) * np.minimum(local * 50, 1) * np.exp(-local * 1.8)
    chime += 0.16 * np.sin(2 * np.pi * frequency * local) * envelope
write('chime.wav', chime)