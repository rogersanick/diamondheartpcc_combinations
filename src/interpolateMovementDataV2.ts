/* eslint-disable-next-line */
const fs = require("fs")
const path = `${__dirname}/static/motion_data_v2`

const interpolateKeypoint3D = (keypoint: any, nextKeyPoint: any, interpolationFactor: number) => {
    const { x, y, z } = keypoint
    const { x: nextX, y: nextY, z: nextZ } = nextKeyPoint
    const xDiff = nextX - x
    const yDiff = nextY - y
    const zDiff = nextZ - z
    return [...Array(interpolationFactor).keys()].map((_, i) => {
        return {
            x: x + xDiff * (i / interpolationFactor),
            y: y + yDiff * (i / interpolationFactor),
            z: z + zDiff * (i / interpolationFactor)
        }
    })
}

(async () => {
    fs.readdir(path, async (err: any, files: string[]) => {
        if (err) { 
            console.log(err)
            return
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            await interpolateFile(file, 5)
        }
    })
    
    const interpolateFile = async (fileName: string, interpolationFactor: number) => {
        await fs.readFile(`${path}/${fileName}`, "utf8", async (err: any, data: any) => {
            if (err) {
                console.error(err)
                return
            }
            const parsed = JSON.parse(data)
            const processed: any[] = []
            for (let i = 1; i < parsed.length; i++) {
                const prevPose = parsed[i - 1]
                const currPose = parsed[i]
                
                
                const framesToBePopulated: {[key:string]: any}[] = [...Array(interpolationFactor).keys()].map(_ => ({}))
                Object.keys(currPose).forEach(key => {
                    if (prevPose[key] && currPose[key]) {
                        interpolateKeypoint3D(prevPose[key], currPose[key], interpolationFactor).forEach((ele, i) => {
                            framesToBePopulated[i][key] = ele
                        })
                    }
                })
                processed.push(...framesToBePopulated)
            }
            const fileNameWithoutExtension = fileName.split(".")[0]
            await fs.writeFileSync(`${path}/${fileNameWithoutExtension}_interpolated.json`,
                JSON.stringify(processed),{encoding:"utf8",flag:"w"})
        })
    }
})()
