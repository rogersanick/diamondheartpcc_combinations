import { AmbientLight, DirectionalLight, PointLight, Scene, SpotLight, SpotLightHelper } from "three"

/**
  * Lights
  */
const addLights = (scene: Scene) => {
    const ambientLight = new AmbientLight(0xffffff, 4)
    scene.add(ambientLight)
}

export { addLights }