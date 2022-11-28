/* eslint-disable-next-line */
const fs = require("fs")
const path = `${__dirname}/static/motion_data`;

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
            const processed = parsed.map((ele: any) => {
                if (ele[0]) {
                    return [{
                        keypoints3D: ele[0].keypoints3D
                    }]
                }
            }).filter((ele: any) => ele)
            const processedCleanedJSON = JSON.stringify(processed).replace(/"\s+|\s+"/g,"\"")
            await fs.writeFileSync(`${path}/${fileName}_smol.json`,processedCleanedJSON,{encoding:"utf8",flag:"w"})
        })
    }
    
})()
