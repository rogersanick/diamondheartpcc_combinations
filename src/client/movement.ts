import * as poseDetection from "@tensorflow-models/pose-detection"
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection"
import * as mpHands from "@mediapipe/hands"
import * as mpPose from "@mediapipe/pose"

// Creates a video element and gets the users webcam video input
let video: HTMLVideoElement = document.createElement("video")
const setupVideo = async (fileName: string, playbackSpeed = 1) => {
    // if (video) {
    //     document.getElementById("boblet_bot_input")?.remove()
    // }
    video = document.createElement("video")
    video.id = "boblet_bot_input"
    video.style.maxHeight = "200px"
    video.style.display = "flex"
    video.style.margin = "auto"
    // document.body.prepend(video)
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

const createHandPoseDetector = async () => {
    const model = handPoseDetection.SupportedModels.MediaPipeHands
    return await handPoseDetection.createDetector(model, {
        runtime: "mediapipe",
        modelType: "full",
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}`
    })
}

const createBodyPoseDetector = async () => {
    return await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, {
        runtime: "mediapipe", // or 'tfjs'
        modelType: "full",
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
    })
}

export { setupVideo, createHandPoseDetector, createBodyPoseDetector }