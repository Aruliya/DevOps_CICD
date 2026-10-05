import {
    HandLandmarker,
    FilesetResolver
}
from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const video = document.getElementById("video");

const gestureText =
    document.getElementById("gesture");

const bassText =
    document.getElementById("bass");

const startBtn =
    document.getElementById("startBtn");

let handLandmarker;

let audioContext;
let bassFilter;

let bassEnabled = false;

async function setupAudio() {

    const stream =
        await navigator.mediaDevices
            .getUserMedia({
                audio: true
            });

    audioContext =
        new AudioContext();

    const source =
        audioContext.createMediaStreamSource(
            stream
        );

    bassFilter =
        audioContext.createBiquadFilter();

    bassFilter.type =
        "lowshelf";

    bassFilter.frequency.value =
        200;

    bassFilter.gain.value =
        0;

    source.connect(
        bassFilter
    );

    bassFilter.connect(
        audioContext.destination
    );
}

function enableBass() {

    bassEnabled = true;

    bassFilter.gain.value = 20;

    bassText.textContent = "ON";
}

function disableBass() {

    bassEnabled = false;

    bassFilter.gain.value = 0;

    bassText.textContent = "OFF";
}

async function setupCamera() {

    const stream =
        await navigator.mediaDevices
            .getUserMedia({
                video: true
            });

    video.srcObject = stream;

    return new Promise(resolve => {

        video.onloadedmetadata = () => {
            resolve();
        };

    });
}

async function setupMediapipe() {

    const vision =
        await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
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

function openPalm(landmarks) {

    const tips =
        [8, 12, 16, 20];

    const pips =
        [6, 10, 14, 18];

    let count = 0;

    for (let i = 0; i < 4; i++) {

        if (
            landmarks[tips[i]].y <
            landmarks[pips[i]].y
        ) {
            count++;
        }
    }

    return count >= 4;
}

async function detectHands() {

    const results =
        handLandmarker.detectForVideo(
            video,
            performance.now()
        );

    if (
        results.landmarks &&
        results.landmarks.length > 0
    ) {

        const hand =
            results.landmarks[0];

        if (openPalm(hand)) {

            gestureText.textContent =
                "OPEN PALM";

            enableBass();

        } else {

            gestureText.textContent =
                "OTHER";

            disableBass();
        }

    } else {

        gestureText.textContent =
            "NONE";

        disableBass();
    }

    requestAnimationFrame(
        detectHands
    );
}

startBtn.addEventListener(
    "click",
    async () => {

        startBtn.disabled = true;

        await setupCamera();

        await setupMediapipe();

        await setupAudio();

        detectHands();
    }
);
