import * as poseDetection from "@tensorflow-models/pose-detection"
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection"
import * as mpHands from "@mediapipe/hands"
import * as mpPose from "@mediapipe/pose"
import "@tensorflow/tfjs-backend-webgl"

// Creates a video element and gets the users webcam video input
let video: HTMLVideoElement = document.createElement("video")
const setupVideo = async (fileName: string, playbackSpeed = 1) => {
    if (video) {
        video.style.opacity = "0"
        // Wait for fade out
        await new Promise((resolve) => setTimeout(resolve, 200))
        document.getElementById("boblet_bot_input")?.remove()
    }
    video = document.createElement("video")
    video.id = "boblet_bot_input"
    video.id = "boblet_bot_input"
    video.style.maxWidth = "40vw"
    video.style.maxHeight = "500px"
    video.style.margin = "auto"
    video.style.display = "flex"
    video.style.position = "absolute"
    video.style.border = "solid white 5px"
    video.style.bottom = "30px"
    video.style.right = "30px"
    video.style.borderRadius = "30px"
    video.style.opacity = "100"
    video.style.transition = "opacity 0.2s ease-in-out"
    document.body.append(video)
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.src = fileName
    video.playbackRate = playbackSpeed
    // const camera = await navigator.mediaDevices.getUserMedia({ video: true })
    // video.srcObject = camera
    video.loop = true
    return await new Promise<HTMLVideoElement>((resolve) => {
        video.onloadeddata = () => {
            video.play()
            resolve(video)
        }
    })
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

const createBlazePoseDetector = async (modelType: "lite" | "full" | "heavy", isMobileClient: boolean) => {
    // Create a pose detector w/ tfjs instead of mediapipe
    return isMobileClient ? await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, {
        enableSmoothing: true,
        runtime: "tfjs",
        modelType: modelType,
    }): await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, {
        enableSmoothing: true,
        runtime: "mediapipe",
        modelType: modelType,
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
    })
}

const movementDataSourceNames = [
    "pcc_fight_stance", 
    "pcc_combo_1", 
    "pcc_combo_2",
    "pcc_combo_3",
    "pcc_combo_4",
    "pcc_combo_5",
    "pcc_combo_6",
    "pcc_combo_7",
    "pcc_combo_8",
    "pcc_combo_9",
    "pcc_combo_10"
] 

export { movementDataSourceNames, setupVideo, removeVideo, 
    createHandPoseDetector, createBlazePoseDetector }