import { GUI } from "dat.gui"
import { Group, Mesh, Object3D, Scene, Vector3 } from "three"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { setPositionFromVector, setRotationFromVectors } from "./utils/vectorUtils"

export default class Gloves {
    leftGroup: Group = new Group()
    left: Object3D<Event> | null = null
    rightGroup: Group = new Group()
    right: Object3D<Event> | null = null
    constructor(gltfLoader: GLTFLoader, gui: GUI, debugObject: any, scene: Scene) {
        gltfLoader.load("/models/boxing_gloves_left_handed/scene.gltf", (gltf) => {
            const glove = traverseSceneAndExtractChild(gltf.scene, "Boxing_Glove003_Glove_Material_0")
            glove && (glove.castShadow = true)
            glove && (glove.receiveShadow = true)
            if (!glove) { throw new Error("Glove not found") }
            glove.scale.setScalar(debugObject.gloveScale)
            this.left = glove
            this.leftGroup.add(glove)
            scene.add(this.leftGroup)
        })
        gltfLoader.load("/models/boxing_gloves_right_handed/scene.gltf", (gltf) => {
            const glove = traverseSceneAndExtractChild(gltf.scene, "Boxing_Glove003_Glove_Material_0")
            glove && (glove.castShadow = true)
            glove && (glove.receiveShadow = true)
            if (!glove) { throw new Error("Glove not found") }
            glove.scale.setScalar(debugObject.gloveScale)
            this.right = glove
            this.rightGroup.add(glove)
            scene.add(this.rightGroup)
        })
        gui.add(debugObject, "gloveScale", 0, 0.005, 0.0005).onChange(()  => {
            this.left?.scale.setScalar(debugObject.gloveScale)
            this.right?.scale.setScalar(debugObject.gloveScale)
        })
    }


    positionLeftHand(
        vectors: { [key: string]: Vector3 }
    ) {

        const left_wrist = vectors["left_wrist"]
        const left_elbow = vectors["left_elbow"]
        const left_pinky = vectors["left_pinky"]
        const left_index = vectors["left_index"]

        // Set glove position
        setPositionFromVector(left_wrist, this.leftGroup)

        // Set rotation from wrist-elbow vector
        setRotationFromVectors(left_wrist, left_elbow, this.leftGroup, 0.7)

        // Rotate wrist rotation
        const knucklesVector = left_index.sub(left_pinky)
        const knucklesAngle = knucklesVector.angleTo(new Vector3(0, -1, 0))
        this.left?.rotation.set(this.left?.rotation.x, knucklesAngle, this.left?.rotation.z)
    }

    positionRightHand(
        vectors: { [key: string]: Vector3 }
    ) {
        const right_wrist = vectors["right_wrist"]
        const right_elbow = vectors["right_elbow"]
        const right_pinky = vectors["right_pinky"]
        const right_index = vectors["right_index"]

        // Set glove position
        setPositionFromVector(right_wrist, this.rightGroup)

        // Set rotation from wrist-elbow vector
        setRotationFromVectors(right_wrist, right_elbow, this.rightGroup, 0.7)

        // Rotate wrist to elbow
        const knucklesVector = right_pinky.sub(right_index)
        const knucklesAngle = knucklesVector.angleTo(new Vector3(0, -1, 0))
        this.right?.rotation.set(0, -knucklesAngle, 0)
    }

    
}

const traverseSceneAndExtractChild = (scene: GLTF["scene"], name: string): Object3D<Event> | null => {
    let retrievedChild: Object3D<Event> | null = null
    scene.traverse(child => {
        if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.name === name) {
                retrievedChild = child as any
            }   
        }
    })
    return retrievedChild
}