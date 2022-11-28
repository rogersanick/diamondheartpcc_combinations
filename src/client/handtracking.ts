import * as handPoseDetection from "@tensorflow-models/hand-pose-detection"
import { Group } from "three"
 
/** 
  * Apply coordinates to hands
  */
export const applyCoordinates = (hand: handPoseDetection.Hand, handMeshes: Group, left: boolean) => {
    hand.keypoints3D?.forEach((point, index) => {
        const { x, y, z } = point
        const newX = x * 5 + 2 * (left ? -1 : 1)
        const newY = -y * 5 + 2
        const newZ = z! * 5
        
        if (Math.abs(handMeshes.children[index].position.x - newX) > 0.02) {
            handMeshes.children[index].position.x = newX
        }
        
        if (Math.abs(handMeshes.children[index].position.y - newY) > 0.02) {
            handMeshes.children[index].position.y = newY
        }

        if (Math.abs(handMeshes.children[index].position.z - newZ) > 0.02) {
            handMeshes.children[index].position.z = newZ
        }
    })
}

//  (handPoseDetector && video) && handPoseDetector?.estimateHands(
//     video!, {
//     flipHorizontal: true,
//     }).then(results => {
//         results.forEach(hand => {
//             hand.handedness === 'Right' ? applyCoordinates(hand, rightHand, false) : applyCoordinates(hand, leftHand, true);
//         })
//  });