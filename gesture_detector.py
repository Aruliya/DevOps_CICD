import cv2
import mediapipe as mp


class GestureDetector:

    def __init__(self):

        self.mp_hands = mp.solutions.hands

        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )

        self.mp_draw = mp.solutions.drawing_utils

    def detect(self, frame):

        rgb = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        result = self.hands.process(rgb)

        gesture = "NONE"

        if result.multi_hand_landmarks:

            for hand in result.multi_hand_landmarks:

                self.mp_draw.draw_landmarks(
                    frame,
                    hand,
                    self.mp_hands.HAND_CONNECTIONS
                )

                if self.is_open_palm(hand):
                    gesture = "OPEN_PALM"

        return gesture, frame

    def is_open_palm(self, hand):

        tips = [8, 12, 16, 20]
        pips = [6, 10, 14, 18]

        count = 0

        for tip, pip in zip(tips, pips):

            if (
                hand.landmark[tip].y
                <
                hand.landmark[pip].y
            ):
                count += 1

        return count >= 4
