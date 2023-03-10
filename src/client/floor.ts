import { Mesh, MeshPhongMaterial, PlaneGeometry } from "three"

/**
  * Floor
  */
const generatePlane = (isMobileClient: boolean) => {
    const floor = new Mesh(
        new PlaneGeometry(40, 40),
        new MeshPhongMaterial({
            color: 0x808080,
        })
    )
    if (!isMobileClient) {
        floor.receiveShadow = true
    }
    floor.rotation.x = - Math.PI * 0.5
    return floor
}

export { generatePlane }
