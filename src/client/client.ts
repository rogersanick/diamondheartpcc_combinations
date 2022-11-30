import "./style.css"
import { GUI } from "dat.gui"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as poseDetection from "@tensorflow-models/pose-detection"
import Stats from "stats.js"
import { Vector3, WebGLRenderer } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { createBodyPoseDetector, removeVideo, setupVideo } from "./movement"
import { addLights } from "./lights"
import { generatePlane} from "./floor"
import Gloves from "./gloves"
import BobletBot from "./bobletBotModel"
import { addLoadingIndicator, removeLoadingIndicator } from "./loader"
import { processJSONFrameToVectors, processVideoFrameToVectors } from "./utils/vectorProcessingUtils"
import { adjustFrameForScale } from "./utils/vectorUtils"
import e from "express"

// CONSTANTS
// TODO: Move these to another file
/** List out data set names */
const movementDataSourceNames = [
    "fight_stance", 
    "combo_1", 
    "combo_2", 
    "combo_3",
    "combo_4",
    "combo_5",
    "combo_6",
    "combo_7",
    "combo_8",
    "combo_9",
    "combo_10",
    "combo_1_v2", 
    "combo_2_v2", 
    "combo_3_v2",
    "combo_4_v2",
    "combo_5_v2",
    "combo_6_v2",
    "combo_7_v2",
    "combo_8_v2",
    "combo_9_v2",
    "combo_10_v2"
]

// EPIC: BUG FIXES
// TODO: Fix glove rotation bug

// EPIC: USABILITY
// TODO: Enable full switching btw JSON / video by fromVideo
// TODO: Get rid of chatter

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
    const debugObject = {
        fromVideo: false,
        playbackSpeed: 1,
        motionDataScale: 5,
        movement_data: "fight_stance",
        gloveScale: 0.0009,
        pause: false,
    }
    gui.add(debugObject, "motionDataScale", 0, 10, 0.01)

    /** Set up basic statistics */
    const stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)

    /** Data Source (either JSON or VIDEO, default to JSON for mobile) */

    // JSON Data Configuration
    const retrieveExtractedJSONData = async (dataSetName: string) => {
        const json = await fetch(`/motion_data/${dataSetName}.json`).then(res => res.json())
        return json.map((frame: any) => processJSONFrameToVectors(frame, debugObject))
    }
    let processedCurrentJSONDataSet: any = await retrieveExtractedJSONData(debugObject.movement_data)

    // Video Data Configuration
    let video: HTMLVideoElement | null = null
    let poseDetector: poseDetection.PoseDetector | null = null
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

    // Conditionally reset either the JSON or Video data source
    const resetDataSource = async (ele: boolean) => {
        if (ele) {
            if (!poseDetector) { poseDetector = await createBodyPoseDetector() }
            video = await setupVideo(`/videos/${debugObject.movement_data}.MOV`, debugObject.playbackSpeed)
        } else {
            // Start at the beginning 
            frame = 0
    
            // Retrieve all of the movement data
            const retrieveExtractedJSONData = async (dataSetName: string) => {
                const json = await fetch(`/motion_data/${dataSetName}.json`).then(res => res.json())
                return json.map((frame: any) => processJSONFrameToVectors(frame, debugObject))
            }
                
            // Get the initial JSON data
            processedCurrentJSONDataSet = await retrieveExtractedJSONData(debugObject.movement_data)
                
            // Remove the initial video source
            removeVideo()
        }
    }

    // Allow user to change data source 
    gui.add(
        debugObject, 
        "movement_data", 
        movementDataSourceNames
    ).onChange(async () => {
        resetDataSource(debugObject.fromVideo)
    })

    // Allow user to switch between video and JSON data source
    gui.add(debugObject, "fromVideo").onChange(resetDataSource)

    /** Setup renderer and scene */
    const canvas = document.querySelector("canvas.webgl")!
    const renderer = new WebGLRenderer({ canvas, antialias: true })
    renderer.physicallyCorrectLights = true
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Scene
    const scene = new THREE.Scene()
    const axesHelper = new THREE.AxesHelper( 5 )
    scene.add( axesHelper )

    /** Loaders */
    const gltfLoader = new GLTFLoader()
    const gloves = new Gloves(gltfLoader, gui, debugObject, scene)
    const textureLoader = new THREE.TextureLoader()
 
    const light = addLights(scene)
    const floor = generatePlane()
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
    camera.position.set(-10, 13, 18)
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas as HTMLElement)
    controls.enableDamping = true

    /** Boblet bot creation */
    const bobletBot = new BobletBot(debugObject)
    bobletBot.addSelfToScene(scene)

    /** Animate */
    const clock = new THREE.Clock()
    let frame = 0
    const tick = async () =>
    {
        stats.begin()
        const delta = clock.getDelta()

        if (!debugObject.pause) {
            /** Boblet bot from video stream */
            if (debugObject.fromVideo && video && poseDetector) {
                const vectorsAtFrame = await processVideoFrameToVectors(poseDetector, video, debugObject)
                if (vectorsAtFrame) {
                    const scaledVectorsAtFrame = adjustFrameForScale(vectorsAtFrame, debugObject.motionDataScale)
                    bobletBot.positionSelfFromMotionData(scaledVectorsAtFrame)
                    gloves.positionLeftHand(scaledVectorsAtFrame)
                    gloves.positionRightHand(scaledVectorsAtFrame)
                }
            }

            /** Boblet bot from JSON */
            if (!debugObject.fromVideo) {
                const vectorsAtFrame = adjustFrameForScale(
                    processedCurrentJSONDataSet[frame][0], debugObject.motionDataScale)
                bobletBot.positionSelfFromMotionData(vectorsAtFrame)
                gloves.positionLeftHand(vectorsAtFrame)
                gloves.positionRightHand(vectorsAtFrame)
                if (frame < processedCurrentJSONDataSet.length - 1) {
                    frame += 1
                } else {
                    frame = 0
                }
            }

            // Move the light
            const elapsedTime = clock.getElapsedTime()
            light.spotLight.position.x = Math.cos(elapsedTime / 2) * 15
            light.spotLight.position.z = Math.sin(elapsedTime / 2) * 15
            light.spotLight.lookAt(new Vector3(0,0,0))
            light.helper.update()
        }

        // Rotate floor
        floor.rotateZ(delta * 0.05)

        // Update controls
        controls.update()

        // Render 
        renderer.render(scene, camera)
 
        stats.end()
        requestAnimationFrame(tick)
    }
 
    removeLoadingIndicator()
    tick()
})()