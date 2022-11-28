import { Mesh, MeshPhongMaterial, PlaneGeometry, Scene } from "three"

/**
  * Floor
  */
const generatePlane = () => {
    const floor = new Mesh(
        new PlaneGeometry(40, 40),
        new MeshPhongMaterial({
            color: 0x808080,
        })
    )
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI * 0.5
    return floor
}

export { generatePlane }
