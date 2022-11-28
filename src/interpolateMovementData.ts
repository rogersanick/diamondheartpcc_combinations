/* eslint-disable-next-line */
const fs = require("fs")
const path = `${__dirname}/static/motion_data`

const interpolateData = (keypoint: any, nextKeyPoint: any) => {
    const { x, y, z } = keypoint
    const { x: nextX, y: nextY, z: nextZ } = nextKeyPoint
    const xDiff = nextX - x
    const yDiff = nextY - y
    const zDiff = nextZ - z
    return [...Array(10).keys()].map((ele) => {
        const next = Object.assign({}, keypoint)
        next.x = next.x + xDiff * (ele / 10)
        next.y = next.y + yDiff * (ele / 10)
        next.z = next.z + zDiff * (ele / 10)
        return next
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
            await cleanFile(file)
        }
    })
    
    const cleanFile = async (fileName: string) => {
        await fs.readFile(`${path}/${fileName}`, "utf8", async (err: any, data: any) => {
            if (err) {
                console.error(err)
                return
            }
            const parsed = JSON.parse(data)
            const processed: any[] = []
            for (let i = 1; i < parsed.length; i++) {
                const prevFrame = parsed[i - 1]
                const currFrame = parsed[i]
                const framesToBePopulated = [...Array(10).keys()].map(ele => {
                    return [{
                        keypoints3D: [] as any[]
                    }]
                })
                
                const currPose = currFrame[0]
                const prevPose = prevFrame[0]
                currPose.keypoints3D.map((_: any, index: number) => {
                    interpolateData(currPose.keypoints3D[index], prevPose.keypoints3D[index]).forEach((interpolatedKeypoint: any, i: number) => {
                        framesToBePopulated[i][0].keypoints3D.push(interpolatedKeypoint)
                    })
                })
                processed.push(...framesToBePopulated)
            }
            const fileNameWithoutExtension = fileName.split(".")[0]
            await fs.writeFileSync(`${path}/${fileNameWithoutExtension}_interpolated.json`,JSON.stringify(processed),{encoding:"utf8",flag:"w"})
        })
    }
})()
