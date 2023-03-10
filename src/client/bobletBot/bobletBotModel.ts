import { CapsuleGeometry, Mesh, MeshToonMaterial, Scene, SphereGeometry, Vector3 } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { getPositionBetweenVectors, placeJoint, placeLimb, setPositionBetweenVectors, 
    setPositionFromVector, setRotationFromVectors, updateLerpValue, updateSlerpValue } from "../utils/vectorUtils"

class BobletBot {
  
    debugObject: any

    // Limbs
    leftShin: Mesh
    rightShin: Mesh
    leftThigh: Mesh
    rightThigh: Mesh
    leftArm: Mesh
    rightArm: Mesh
    leftForearm: Mesh
    rightForearm: Mesh

    // Head and torso
    head: Mesh
    upperTorso: Mesh
    middleTorso: Mesh
    lowerTorso: Mesh

    // Joints
    leftFoot: Mesh
    rightFoot: Mesh
    leftShoulder: Mesh
    rightShoulder: Mesh
    rightHand: Mesh
    leftHand: Mesh

    // TODO: Fix gloves
    // gloves: Gloves

    scale = 0

    constructor(gltfLoader: GLTFLoader, debugObject: any) {

        this.debugObject = debugObject

        // Get all limbs
        this.leftShin = this.generateLimb(0.22, true)
        this.rightShin = this.generateLimb(0.22, true)
        this.leftThigh = this.generateLimb(0.4)
        this.rightThigh = this.generateLimb(0.4)
        this.leftArm = this.generateLimb(0.2, true)
        this.rightArm = this.generateLimb(0.2, true)
        this.leftForearm = this.generateLimb(0.15)
        this.rightForearm = this.generateLimb(0.15)

        // Make the torso
        this.head = new Mesh(new SphereGeometry(0.5, 16, 16), this.bodyWhiteMaterial)
        this.upperTorso = this.generateLimb (0.15, true, 0.4)
        this.middleTorso = this.generateLimb (0.2, false, 0.35)
        this.lowerTorso = this.generateLimb(0.1, true, 0.35)

        this.leftFoot = this.generateLimb(0.13)
        this.rightFoot = this.generateLimb(0.13)

        // Add all joints
        const generateJoint = (radius: number, material: MeshToonMaterial = this.bodyBlueMaterial) => { 
            return new Mesh(new SphereGeometry(radius, 32, 32), material)
        }
        this.leftShoulder = generateJoint(0.25)
        this.rightShoulder = generateJoint(0.25)
        // this.leftElbow = generateJoint(0.15, this.bodyBlueMaterial)
        // this.rightElbow = generateJoint(0.15, this.bodyBlueMaterial)
        // this.leftHip = generateJoint(0.2)
        // this.rightHip = generateJoint(0.2)
        // this.leftKnee = generateJoint(0.15, this.bodyBlueMaterial)
        // this.rightKnee = generateJoint(0.15, this.bodyBlueMaterial)
        // this.rightHeel = generateJoint(0.15, this.bodyBlueMaterial)
        // this.leftHeel = generateJoint(0.15, this.bodyBlueMaterial)
        this.rightHand = generateJoint(0.3, this.bodyRedMaterial)
        this.leftHand = generateJoint(0.3, this.bodyRedMaterial)

        // Give boblet some Gloves!
        // this.gloves = new Gloves(gltfLoader, debugObject)
    }

    // Body parts
    bodyBlueMaterial = new MeshToonMaterial({
        color: 0x294db4,
    })

    bodyWhiteMaterial = new MeshToonMaterial({
        color: 0xffffff,
    })

    bodyRedMaterial = new MeshToonMaterial({
        color: 0xf43634,
    })

    generateLimb = (length: number, blue = false, width?: number) => {
        const limb = new Mesh(
            new CapsuleGeometry(width ? width: 0.1, this.debugObject.motionDataScale * length, 16, 16),
            blue ? this.bodyBlueMaterial : this.bodyWhiteMaterial)
        limb.castShadow = true
        return limb
    }

    addSelfToScene = (scene: Scene) => {
        scene.add(
            this.leftShin, this.rightShin, 
            this.leftThigh, this.rightThigh, this.leftArm, this.rightArm, 
            this.leftForearm, this.rightForearm, this.head, this.upperTorso, 
            this.middleTorso, this.lowerTorso, this.leftFoot, this.rightFoot, 
            this.leftShoulder, this.rightShoulder, this.rightHand, this.leftHand
        )
    }

    positionSelfFromMotionData(points: {[key: string]: Vector3}, slerpValue = 0.8, lerpValue = 0.8) {

        // Set the lerp / slerp values
        updateLerpValue(lerpValue)
        updateSlerpValue(slerpValue)

        // Set the position of all limbs
        placeLimb(points["left_knee"], points["left_ankle"], this.leftShin)
        placeLimb(points["right_knee"], points["right_ankle"], this.rightShin)
        placeLimb(points["left_hip"], points["left_knee"], this.leftThigh)
        placeLimb(points["right_hip"], points["right_knee"], this.rightThigh)
        placeLimb(points["left_shoulder"], points["left_elbow"], this.leftArm)
        placeLimb(points["right_shoulder"], points["right_elbow"], this.rightArm)
        placeLimb(points["left_elbow"], points["left_wrist"], this.leftForearm)
        placeLimb(points["right_elbow"], points["right_wrist"], this.rightForearm)
        placeLimb(points["left_heel"], points["left_foot_index"], this.leftFoot)
        placeLimb(points["right_heel"], points["right_foot_index"], this.rightFoot)
      
        // Place all of the joints
        placeJoint(points["left_shoulder"], this.leftShoulder)
        placeJoint(points["right_shoulder"], this.rightShoulder)
        // placeJoint(points["left_elbow"], this.leftElbow)
        // placeJoint(points["right_elbow"], this.rightElbow)
        // placeJoint(points["left_hip"], this.leftHip)
        // placeJoint(points["right_hip"], this.rightHip)
        // placeJoint(points["left_knee"], this.leftKnee)
        // placeJoint(points["right_knee"], this.rightKnee)
        // placeJoint(points["left_heel"], this.leftHeel)
        // placeJoint(points["right_heel"], this.rightHeel)
        placeJoint(points["left_wrist"], this.leftHand)
        placeJoint(points["right_wrist"], this.rightHand)
      
        // Set the position of the torso
        const shouldersMidpoint = getPositionBetweenVectors(points["left_shoulder"], points["right_shoulder"])
        const hipsMidpoint = getPositionBetweenVectors(points["left_hip"], points["right_hip"])
        const spineMidpoint = getPositionBetweenVectors(shouldersMidpoint, hipsMidpoint)
                  
        setPositionFromVector(shouldersMidpoint, this.upperTorso)
        setPositionBetweenVectors(shouldersMidpoint, spineMidpoint, this.middleTorso)
        setPositionBetweenVectors(hipsMidpoint, spineMidpoint, this.lowerTorso)
      
        setRotationFromVectors(points["left_shoulder"], points["right_shoulder"], this.upperTorso)
        setRotationFromVectors(points["left_hip"], points["right_hip"], this.lowerTorso)
      
        // Set the position of the head
        const noseVector = points["nose"]
      
        // Set the position of the head
        const leftEarVector = points["left_ear"]
        const rightEarVector = points["right_ear"]
        const betweenEars = leftEarVector.clone().add(rightEarVector).divideScalar(2)
        setPositionBetweenVectors(noseVector, betweenEars, this.head)
    }
}

export default BobletBot