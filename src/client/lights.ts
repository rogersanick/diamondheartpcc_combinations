import { AmbientLight, Scene, SpotLight, SpotLightHelper } from "three"

/**
  * Lights
  */
const addLights = (scene: Scene, isMobileClient: boolean) => {
    const ambientLight = new AmbientLight(0xffffff, 5)
    scene.add(ambientLight)
  
    const spotLight = new SpotLight(0xffffff, 50, 30, Math.PI * 0.2, 0.25, 1)
    spotLight.position.set(0, 15, 15)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    spotLight.shadow.camera.near = 1
    spotLight.shadow.camera.far = 100
    if (!isMobileClient) {
        scene.add(spotLight)
        ambientLight.intensity = 3
    }
    

    return {
        spotLight,
    }
}

export { addLights }