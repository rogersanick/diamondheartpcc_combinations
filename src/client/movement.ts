import * as poseDetection from "@tensorflow-models/pose-detection"
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection"
import * as mpHands from "@mediapipe/hands"
import * as mpPose from "@mediapipe/pose"
import "@tensorflow/tfjs-backend-webgl"

// Creates a video element and gets the users webcam video input
let video: HTMLVideoElement = document.createElement("video")
const setupVideo = async (fileName: string, playbackSpeed = 1) => {
    if (video) {
        document.getElementById("boblet_bot_input")?.remove()
    }
    video = document.createElement("video")
    video.id = "boblet_bot_input"
    video.style.maxHeight = "50vh"
    video.style.display = "flex"
    video.style.bottom = "0"
    video.style.right = "0"
    video.style.position = "absolute"
    document.body.append(video)
    video.autoplay = true
    video.muted = true
    video.src = fileName
    video.playbackRate = playbackSpeed
    // const camera = await navigator.mediaDevices.getUserMedia({ video: true })
    // video.srcObject = camera
    video.play()
    video.loop = true
    await new Promise((resolve) => {
        video.onloadeddata = () => {
            resolve(video)
        }
    })
    return video
}

const removeVideo = () => {
    video.remove()
}

const createHandPoseDetector = async () => {
    const model = handPoseDetection.SupportedModels.MediaPipeHands
    return await handPoseDetection.createDetector(model, {
        runtime: "mediapipe",
        modelType: "full",
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}`
    })
}

const createBlazePoseDetector = async (modelType: "light" | "full" | "heavy") => {
    return await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, {
        enableSmoothing: true,
        runtime: "mediapipe", // or 'tfjs'
        modelType: modelType,
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
    })
}

export { setupVideo, removeVideo, createHandPoseDetector, createBlazePoseDetector }