import {
    FilesetResolver,
    HandLandmarker
}
from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

const video =
    document.getElementById("video");

const gestureText =
    document.getElementById("gesture");

const bassText =
    document.getElementById("bass");

const startBtn =
    document.getElementById("startBtn");

let handLandmarker;

let audioContext;
let bassFilter;

async function setupAudio() {

    const audioStream =
        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

    audioContext =
        new AudioContext();

    const source =
        audioContext.createMediaStreamSource(
            audioStream
        );

    bassFilter =
        audioContext.createBiquadFilter();

    bassFilter.type =
        "lowshelf";

    bassFilter.frequency.value =
        200;

    bassFilter.gain.value =
        0;

    source.connect(bassFilter);
    bassFilter.connect(audioContext.destination);
}

function enableBass() {

    bassFilter.gain.value = 20;

    bassText.textContent = "ON";
}

function disableBass() {

    bassFilter.gain.value = 0;

    bassText.textContent = "OFF";
}

async function setupCamera() {

    const stream =
        await navigator.mediaDevices.getUserMedia({
            video: true
        });

    video.srcObject = stream;

    await video.play();
}

async function setupMediapipe() {

    const vision =
        await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

    handLandmarker =
        await HandLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
                },

                runningMode: "VIDEO",

                numHands: 1
            }
        );
}

function isOpenPalm(hand) {

    const tips =
        [8, 12, 16, 20];

    const pips =
        [6, 10, 14, 18];

    let opened = 0;

    for (let i = 0; i < tips.length; i++) {

        if (
            hand[tips[i]].y <
            hand[pips[i]].y
        ) {
            opened++;
        }
    }

    return opened >= 4;
}

function detectLoop() {

    const result =
        handLandmarker.detectForVideo(
            video,
            performance.now()
        );

    if (
        result.landmarks &&
        result.landmarks.length > 0
    ) {

        const hand =
            result.landmarks[0];

        if (isOpenPalm(hand)) {

            gestureText.textContent =
                "OPEN PALM";

            enableBass();

        } else {

            gestureText.textContent =
                "HAND DETECTED";

            disableBass();
        }

    } else {

        gestureText.textContent =
            "NONE";

        disableBass();
    }

    requestAnimationFrame(
        detectLoop
    );
}

startBtn.addEventListener(
    "click",
    async () => {

        try {

            startBtn.disabled = true;

            await setupCamera();

            await setupAudio();

            await setupMediapipe();

            detectLoop();

            console.log(
                "Application started"
            );

        } catch (error) {

            console.error(error);

            alert(
                "Error: " +
                error.message
            );
        }
    }
);
