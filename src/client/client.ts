import "./style.css"
import { GUI } from "dat.gui"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as poseDetection from "@tensorflow-models/pose-detection"
import Stats from "stats.js"
import { WebGLRenderer } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { createBlazePoseDetector, setupVideo } from "./movement"
import { addLights } from "./lights"
import { generatePlane} from "./floor"
import BobletBot from "./bobletBot/bobletBotModel"
import { addLoadingIndicator, removeLoadingIndicator } from "./loader"
import { processBlazePoseFrameToVectors } from "./utils/vectorProcessingUtils"
import { adjustFrameForScale } from "./utils/vectorUtils"
import { movementDataSourceNames } from "./movement"
import { detectDevice } from "./utils/device"
import { createComboGui } from "./comboGui"

// EPIC: BUG FIXES
// TODO: Fix glove rotation bug

// EPIC: USABILITY
// TODO: Enable full switching btw JSON / video by fromVideo

// EPIC: PERFORMANCE / MOBILE
// TODO: Node script OR UI for extracting reliable PER FRAME pose data from input
// TODO: Implement expontial moving average

/**
 *  TOTHINK/DO: Model movement is smoother from video input than JSON.
 * 
 *  Video input / pose estimation means that poses are roughly syncronous with the current frame of the video.
 *  JSON input conversely has no such relationship as the predicted keypoint vectors are done at an unpredicted
 *  / measured rate which is unsyncronized with the render of the scene.
 * 
 *  TODO:
 *  - Implement a way to syncronize the JSON pose data with the render of the scene
 *  - Smooth video input using GSAP
 *  - Enforce frame rate of three.js render
 */ 

/** Set up a loading indicator */
addLoadingIndicator();

/** Begin 3D Rendering */
(async () => {
    
    /** GUI Setup & Stats setup */
    const gui = new GUI()
    const isMobileClient = detectDevice()
    const debugObject = {
        playbackSpeed: 1,
        motionDataScale: 5,
        movement_data: movementDataSourceNames[0],
        gloveScale: 0.0009,
        pause: false,
        model: "lite" as "lite" | "full" | "heavy",
    }
    gui.add(debugObject, "motionDataScale", 0, 10, 0.01)
    gui.close()

    /** Set up basic statistics */
    // const stats = new Stats()
    // stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(stats.dom)

    // Set up combo input
    createComboGui(movementDataSourceNames, async (ele: Event) => {
        if (movementDataSourceNames.includes((ele.target as HTMLSelectElement).value)) {
            debugObject.movement_data = (ele.target as HTMLSelectElement).value
            gui.updateDisplay()
            resetDataSource()
        }
    })

    // Video Data Configuration
    let video: HTMLVideoElement = 
        await setupVideo(`/videos/${debugObject.movement_data}.mov`, debugObject.playbackSpeed, isMobileClient)
    let blazePoseDetector: poseDetection.PoseDetector = await createBlazePoseDetector(debugObject.model, isMobileClient)
    gui.add(debugObject, "playbackSpeed", 0, 2, 0.01).onChange(() => {
        if (video) {
            video.playbackRate = debugObject.playbackSpeed
        }
    })

    gui.add(debugObject, "pause").onChange((value) => {
        if (value) {
            video?.pause()
        } else {
            video?.play()
        }
    })

    gui.add(debugObject, "model", ["lite", "full", "heavy"]).onChange(async (value) => {
        video?.pause()
        blazePoseDetector?.dispose()
        blazePoseDetector = await createBlazePoseDetector(value, isMobileClient)
        video?.play()
    })
    
    // Conditionally reset either the JSON or Video data source
    const resetDataSource = async () => {
        video?.pause()
        blazePoseDetector?.dispose()
        blazePoseDetector = await createBlazePoseDetector(debugObject.model, isMobileClient)
        video = await setupVideo(`/videos/${debugObject.movement_data}.mov`, debugObject.playbackSpeed, isMobileClient)
    }

    // Allow user to change data source 
    gui.add(
        debugObject, 
        "movement_data", 
        movementDataSourceNames
    ).onChange(async () => {
        resetDataSource()
    })

    /** Setup renderer and scene */
    const canvas = document.querySelector("canvas.webgl")!
    const renderer = new WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.physicallyCorrectLights = true

    // Scene
    const scene = new THREE.Scene()
    const axesHelper = new THREE.AxesHelper( 5 )
    scene.add( axesHelper )

    /** Loaders */
    const gltfLoader = new GLTFLoader()
    const textureLoader = new THREE.TextureLoader()
 
    addLights(scene, isMobileClient)
    const floor = generatePlane(isMobileClient)
    textureLoader.load("/logo/dh_logo.png", (texture) => {
        floor.material.map = texture
        floor.material.needsUpdate = true
    })
    scene.add(floor)
 
    /**
    * Setup renderer
    */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }
 
    window.addEventListener("resize", () =>
    {
    // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
 
        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
 
        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    /** Camera & User Camera */
    const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
    camera.position.set(-10, 17, 18)
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas as HTMLElement)
    controls.enableDamping = true

    /** Boblet bot creation */
    const bobletBot = new BobletBot(gltfLoader, debugObject)
    bobletBot.addSelfToScene(scene)

    // Process from live video
    const processFromVideoMode = async () => {
        
        /** Boblet bot from video stream */
        if (video && !video.paused && blazePoseDetector) {
            const poseData = await blazePoseDetector?.estimatePoses(video, { flipHorizontal: true })
            const vectorsAtFrame = await processBlazePoseFrameToVectors(poseData)
            if (vectorsAtFrame) {
                const scaledVectorsAtFrame = adjustFrameForScale(vectorsAtFrame, debugObject.motionDataScale)
                bobletBot.positionSelfFromMotionData(scaledVectorsAtFrame)
            }
        }
    
        // Update controls
        controls.update()
    }

    /** Animate */
    const tick = async () =>
    {
        // stats.begin()

        if (!debugObject.pause) {

            processFromVideoMode()

            // Render 
            renderer.render(scene, camera)
        }
 
        // stats.end()
        requestAnimationFrame(tick)
    }
 
    removeLoadingIndicator()
    tick()
})()


// Reset data source selection code
// else if (ele === "fromJSON") {
//     // Start at the beginning 
//     frame = 0
        
//     // Get the initial JSON data
//     processedCurrentJSONDataSetV1 = await retrieveExtractedJSONDataV1(debugObject.movement_data)
        
//     // Remove the initial video source
//     removeVideo()
// } else if (ele === "fromJSONV2") {
//     // Start at the beginning 
//     frame = 0
                    
//     // Get the initial JSON data
//     processedCurrentJSONDataSetV2 = await retrieveExtractedJSONDataV2(debugObject.movement_data)
                    
//     // Remove the initial video source
//     removeVideo()
// }

// JSON data retrieval

// JSON Data Configuration V1 (deprecated)
// const retrieveExtractedJSONDataV1 = async (dataSetName: string) => {
//     const json = await fetch(`/motion_data/${dataSetName}.json`).then(res => res.json())
//     return json.map((frame: any) => processJSONFrameToVectors(frame, debugObject))
// }
// let processedCurrentJSONDataSetV1: any = await retrieveExtractedJSONDataV1(debugObject.movement_data)

// // JSON Data Configuration V2
// const retrieveExtractedJSONDataV2 = async (dataSetName: string) => {
//     const json = await fetch(`/motion_data_v2/${dataSetName}.json`).then(res => res.json())
//     return json.map((frame: any) => {
//         const processedFrame: any = {}
//         Object.entries(frame).forEach(([key, value]: any) => {
//             processedFrame[key] = new Vector3(value.x, value.y, value.z)
//         })
//         return processedFrame
//     })
// }
// let processedCurrentJSONDataSetV2: any = await retrieveExtractedJSONDataV2(debugObject.movement_data)

// JSON data processing
// // Process from JSON
// const processFromJSONMode = async () => {
//     /** Boblet bot from JSON */
//     const vectorsAtFrame = adjustFrameForScale(
//         processedCurrentJSONDataSetV1[frame][0], debugObject.motionDataScale)
//     bobletBot.positionSelfFromMotionData(vectorsAtFrame)
//     if (frame < processedCurrentJSONDataSetV1.length - 1) {
//         frame += 1
//     } else {
//         frame = 0
//     }
// }

// // Process from JSON upgraded
// const adjustForFPS = 3
// let adjustCounter = 1
// const processFromJSONModeV2 = async () => {

//     /** Boblet bot from JSON V2 */
//     const lerpSlerp = adjustCounter / adjustForFPS
//     bobletBot.positionSelfFromMotionData(processedCurrentJSONDataSetV2[frame], lerpSlerp, lerpSlerp)
//     if (frame < processedCurrentJSONDataSetV2.length - 1) {
//         frame += 1
//     } else {
//         frame = 0
//     }

//     if (adjustCounter < adjustForFPS) {
//         adjustCounter++
//     } else {
//         adjustCounter = 0
//     }
// }

// Extract data from video
// const dataHolder: { [key: string]: Vector3 }[] = []
// let progress: "setup" | "extracting" | "logging" | "done" = "setup"
// const extractDataFromVideo = async () => {
//     if (progress === "setup") {
//         debugObject.pause = true
//         poseDetector.reset()
//         video = await setupVideo(`/videos/${debugObject.movement_data}.MOV`, debugObject.playbackSpeed)
//         video.style.display ="none"
//         video.loop = false
//         progress = "extracting"
//         debugObject.pause = false
//     } else if (progress === "extracting") {
//         if (poseDetector && !video.paused) {
//             const vectorsAtFrame = await processVideoFrameToVectors(poseDetector, video)
//             if (vectorsAtFrame) {
//                 const scaledVectorsAtFrame = adjustFrameForScale(vectorsAtFrame, debugObject.motionDataScale)
//                 dataHolder.push(scaledVectorsAtFrame)
//             }
//         } else {
//             progress = "logging"
//         }
//     } else if (progress === "logging") {
//         console.log(JSON.stringify(dataHolder))
//         progress = "done"
//     } else if (progress === "done") {
//         return
//     }
// }