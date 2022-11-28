import "./style.css"
import { GUI } from "dat.gui"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as poseDetection from "@tensorflow-models/pose-detection"
import Stats from "stats.js"
import { Vector3, WebGLRenderer } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { createBodyPoseDetector, setupVideo } from "./movement"
import { addLights } from "./lights"
import { generatePlane} from "./floor"
import Gloves from "./gloves"
import BobletBot from "./bobletBot"
import gsap from "gsap"
import { addLoadingIndicator, removeLoadingIndicator } from "./loader"
import { processJSONFrameToVectors, processVideoFrameToVectors } from "./utils/vectorProcessingUtils"

// TODO: Implement expontial moving average
// TODO: Fix glove rotation bug
// TODO: Reset movement data extracted from videos

/**
 *  TOTHINK/DO: Model movement is smoother from video input than JSON.
 * 
 *  Video input / pose estimation means that poses are roughly syncronous with the current frame of the video.
 *  JSON input conversely has no such relationship as the predicted keypoint vectors are done at an unpredicted / measured rate
 *  which is unsyncronized with the render of the scene.
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
    
    /**
    * GUI Setup
    */
    const gui = new GUI()
    const debugObject = {
        fromVideo: true,
        playbackSpeed: 1,
        motionDataScale: 5,
        movement_data_movie: "fight_stance",
        movement_data_json: "fight_stance",
        gloveScale: 0.0009,
        pause: false,
        cameraX: -10,
        cameraY: 13,
        cameraZ: 18,
        lightX: 0,
        lightY: 0,
        lightZ: 0,
        headScale: 0.3
    }
    // TODO: Add this back when JSON data is better managed
    // gui.add(debugObject, "fromVideo")
    gui.add(debugObject, "motionDataScale", 0, 10, 0.01)
    const sourceDataFolder = gui.addFolder("source")
    sourceDataFolder.open()
 
    /** Set up basic statistics */
    const stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)
 
    /** List out data set names */
    const movementVideoSourceNames = [
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
    const movementJSONSourceNames = movementVideoSourceNames.flatMap((name) => [name])
    
    /** Retrieve all of the movement data */
    const retrieveExtractedJSONData = async () => {

        const processedMovementDataSets = await Promise.all(movementJSONSourceNames.map(async (ele) => {
            // const json = await fetch(`/motion_data/${ele}.json`).then(res => res.json())
            return {
                name: ele,
                json: {} as any
            }
        }))
        
        /** Process pose JSON into Vectors */
        const processedMovementDataSetMap = processedMovementDataSets.reduce((acc, ele) => {
            acc[ele.name] = ele.json.map((frame: any) => processJSONFrameToVectors(frame, debugObject))
            return acc
        }, {} as {[key: string]: any})
    }


    // TODO: Add this back when JSON performance is improved
    // const processedMovementDataSetMap = await retrieveExtractedJSONData()
    // sourceDataFolder.add(
    //     debugObject, 
    //     "movement_data_json", 
    //     movementJSONSourceNames
    // ).onChange(() => {
    //     frame = 0
    // })

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

    /** Video tracking setup */
    let video: HTMLVideoElement | null = null
    let poseDetector: poseDetection.PoseDetector | null = null
    setupVideo(`/videos/${debugObject.movement_data_movie}.MOV`, debugObject.playbackSpeed).then(async videoElement => {
        video = videoElement
        poseDetector = await createBodyPoseDetector()
    })
    gui.add(debugObject, "playbackSpeed", 0, 2, 0.01).onChange(() => {
        if (video) {
            video!.playbackRate = debugObject.playbackSpeed
        }
    })

    /** Change current video input for movement */
    const changeVideo = (fileName: string) => {
        setupVideo(`/videos/${fileName}.MOV`).then(videoElement => video = videoElement)
    }
    sourceDataFolder.add(
        debugObject, 
        "movement_data_movie", 
        movementVideoSourceNames
    ).onChange(changeVideo)

    gui.add(debugObject, "pause").onChange((value) => {
        if (value) {
            video?.pause()
        } else {
            video?.play()
        }
    })
 
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
 
    /**
     * Cameras
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
    camera.position.set(debugObject.cameraX, debugObject.cameraY, debugObject.cameraZ)
    scene.add(camera)
 
    // Controls
    const controls = new OrbitControls(camera, canvas as HTMLElement)
    controls.enableDamping = true

    const lookAtDebug = () => {
        controls.object.position.set(debugObject.cameraX, debugObject.cameraY, debugObject.cameraZ)
    }
    gui.add(debugObject, "cameraX", -30, 30, 0.01).onChange(lookAtDebug)
    gui.add(debugObject, "cameraY", -30, 30, 0.01).onChange(lookAtDebug)
    gui.add(debugObject, "cameraZ", -30, 30, 0.01).onChange(lookAtDebug)

    /** Boblet bot creation */
    const bobletBot = new BobletBot(debugObject)
    bobletBot.addSelfToScene(scene)

    /**
    * Animate
    */

    const clock = new THREE.Clock()
    // let frame = 0
    const tick = () =>
    {
        stats.begin()

        /** Boblet bot from video stream */
        if (debugObject.fromVideo && video && poseDetector && !debugObject.pause) {
            processVideoFrameToVectors(poseDetector, video, debugObject).then(vectorsAtFrame => {
                bobletBot.positionSelfFromMotionData(vectorsAtFrame!, debugObject.motionDataScale)
                gloves.positionLeftHand(vectorsAtFrame!, debugObject.motionDataScale)
                gloves.positionRightHand(vectorsAtFrame!, debugObject.motionDataScale)
            })
        }

        /** Boblet bot from JSON */
        // if (!debugObject.fromVideo && !debugObject.pause) {
        //     const vectorsAtFrame = processedMovementDataSetMap[debugObject.movement_data_json][frame][0]
        //     bobletBot.positionSelfFromMotionData(vectorsAtFrame, debugObject.motionDataScale)
        //     gloves.positionLeftHand(vectorsAtFrame, debugObject.motionDataScale)
        //     gloves.positionRightHand(vectorsAtFrame, debugObject.motionDataScale)
        //     if (frame < processedMovementDataSetMap[debugObject.movement_data_json].length - 1) {
        //         frame += 1
        //     } else {
        //         frame = 0
        //     }
        // }

        // Move the light
        const elapsedTime = clock.getElapsedTime()
        light.spotLight.position.x = Math.cos(elapsedTime / 2) * 15
        light.spotLight.position.z = Math.sin(elapsedTime / 2) * 15
        light.spotLight.lookAt(new Vector3(0,0,0))
        light.helper.update()

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