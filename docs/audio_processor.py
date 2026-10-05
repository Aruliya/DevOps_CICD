import numpy as np
from scipy.signal import butter
from scipy.signal import lfilter


class AudioProcessor:

    def __init__(self):

        self.sample_rate = 44100
        self.bass_enabled = False

    def set_bass(self, enabled):

        self.bass_enabled = enabled

    def bass_boost(self, data):

        b, a = butter(
            4,
            200 / (self.sample_rate / 2),
            btype="low"
        )

        low = lfilter(
            b,
            a,
            data
        )

        boosted = data + low * 2.0

        return np.clip(
            boosted,
            -1.0,
            1.0
        )

    def process(self, indata):

        if self.bass_enabled:
            return self.bass_boost(indata)

        return indata
