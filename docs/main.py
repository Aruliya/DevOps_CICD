import cv2
import sounddevice as sd

from gesture_detector import GestureDetector
from audio_processor import AudioProcessor


detector = GestureDetector()
processor = AudioProcessor()

cap = cv2.VideoCapture(0)

SAMPLE_RATE = 44100


def audio_callback(
    indata,
    outdata,
    frames,
    time,
    status
):

    processed = processor.process(
        indata.copy()
    )

    outdata[:] = processed


stream = sd.Stream(
    samplerate=SAMPLE_RATE,
    channels=1,
    callback=audio_callback
)

stream.start()

print("Application Started")
print("Show OPEN PALM for bass boost")
print("Press Q to exit")

while True:

    success, frame = cap.read()

    if not success:
        break

    gesture, frame = detector.detect(
        frame
    )

    if gesture == "OPEN_PALM":

        processor.set_bass(True)

        cv2.putText(
            frame,
            "BASS BOOST ON",
            (30, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            3
        )

    else:

        processor.set_bass(False)

        cv2.putText(
            frame,
            "NORMAL",
            (30, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

    cv2.imshow(
        "Gesture Controlled Vocal Enhancer",
        frame
    )

    key = cv2.waitKey(1)

    if key == ord("q"):
        break

stream.stop()
stream.close()

cap.release()
cv2.destroyAllWindows()
