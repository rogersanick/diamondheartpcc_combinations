import { Quaternion, ArrowHelper, Euler, Object3D, Vector3 } from "three"

const lerpValue = 0.5
const slerpValue = 0.7

// Get rotation from vectors 
const getRotationFromVectors = (vector1: Vector3, vector2: Vector3) => {
    return vector1.clone().sub(vector2).normalize()
}

// Set rotation from two vectors
const setRotationFromVectors = (vector1: Vector3, vector2: Vector3, object: Object3D, dampener = 1) => {
    const btwVector = getRotationFromVectors(vector1, vector2)
    setRotationFromVector(btwVector, object, dampener)
}

// Set rotation of object from vector
const setRotationFromVector = (vector: Vector3, object: Object3D, dampener = 1) => {
    const arrowHelper = new ArrowHelper(vector, new Vector3(0, 0, 0), 1, 0xff0000)
    const { x, y, z } = arrowHelper.rotation
    const euler = new Euler(x, y * dampener, z)
    const quaternion = new Quaternion().setFromEuler(euler)
    object.quaternion.slerp(quaternion, slerpValue)
}

const getPositionBetweenVectors = (vector1: Vector3, vector2: Vector3) => {
    return vector1.clone().add(vector2).divideScalar(2)
}

const setPositionFromVector = (vector: Vector3, object: Object3D) => {
    object.position.set(vector.x, vector.y, vector.z)
}

// Set position between two vectors
const setPositionBetweenVectors = (vector1: Vector3, vector2: Vector3, object: Object3D) => {
    const btwVector = getPositionBetweenVectors(vector1, vector2)
    object.position.lerp(btwVector, lerpValue)
}

// Place an object from a single vector
const placeJoint = (vector: Vector3, object: Object3D) => {
    object.position.lerp(vector, lerpValue)
}

// Place a limb and set rotation from two vectors
const placeLimb = (vector1: Vector3, vector2: Vector3, object: Object3D) => {
    setRotationFromVectors(vector1, vector2, object)
    setPositionBetweenVectors(vector1, vector2, object)
}

// Adjust vector for motion data scale
const adjustVectorForScale = (vector: Vector3, scale: number) => {
    const vectorToReturn = new Vector3(vector.x, vector.y, vector.z)
    const { x, y, z } = vectorToReturn
    vectorToReturn.x = -x * scale
    vectorToReturn.y = -(y * scale - scale)
    vectorToReturn.z = -z! * scale
    return vectorToReturn
}

// Adjust frame for scale
const adjustFrameForScale = (frame: { [key: string]: Vector3 }, scale: number) => {
    const frameToReturn = {} as { [key: string]: Vector3 }
    Object.keys(frame).forEach(key => {
        frameToReturn[key] = adjustVectorForScale(frame[key], scale)
    })
    return frameToReturn
}

export { 
    adjustFrameForScale, adjustVectorForScale, placeJoint, setPositionFromVector, 
    getRotationFromVectors, setRotationFromVectors, setRotationFromVector, 
    setPositionBetweenVectors, placeLimb, getPositionBetweenVectors 
}