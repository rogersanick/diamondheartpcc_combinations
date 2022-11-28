import { Vector3 } from "three"
import * as poseDetection from "@tensorflow-models/pose-detection"
import { createBodyPoseDetector } from "../movement"
import { adjustVectorForScale } from "./vectorUtils"

/** Process JSON frame data to Vectors */
const processJSONFrameToVectors = (data: any[], debugObject: any) => {
    return data.reduce((acc, ele) => {
        const keypoints3D = ele.keypoints3D
        const keypointMap = (keypoints3D as Array<any>).reduce((keypointMap, point) => {

            // Build map
            const { x, y, z } = point
            keypointMap[point.name] = new Vector3(x, y, z)

            return keypointMap
        }, {} as {[key: string]: Vector3})
        acc.push(keypointMap)
        return acc
    }, [] as Vector3[])
}

/** Process video frame to Vectors */
const processVideoFrameToVectors = (poseDetector: poseDetection.PoseDetector, video: HTMLVideoElement, debugObject: any) => {
    return poseDetector?.estimatePoses(
        video, {
            flipHorizontal: true,
        }).then(results => {
        const pose = results[0]
        if (!pose.keypoints3D) { return }
        const points: {[key: string]: Vector3} = pose.keypoints3D.reduce((acc, point) => {

            // Build the map
            const { x, y, z } = point
            acc[point.name!] = new Vector3(x, y, z)

            return acc
        }, {} as {[key: string]: Vector3})

        return points
    })
}

/** A utility which extracts movement data from the provided video input */
const processVideoMovementData = async (video: HTMLVideoElement) => {
    const poseDetector = await createBodyPoseDetector()
    const results: any[] = []
    video.loop = false
    while(!video.paused) {
        poseDetector.estimatePoses(video).then(poses => {
            results.push(poses)
        })
    }
    console.log(JSON.stringify(results))
}

export { processJSONFrameToVectors, processVideoFrameToVectors }