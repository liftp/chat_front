import * as fs from 'fs'
import readline from 'readline'

export const readLines = async function(filePath: string, startLine: number, endLine:number): Promise<string[]> {
    return new Promise((resolve, reject) => {
        try {

            let lines: string[] = [];
            const readStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: readStream,
                crlfDelay: Infinity
            })

            let count = 0;
            rl.on('line', (line) => {
                if (count >= startLine && count < endLine) {
                    lines.push(line)
                    count ++;
                } else if (count >= endLine) {
                    rl.close();
                }
            })

            rl.on('close', () => {
                resolve(lines)
            })
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}


export const readLinesCount = async function(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        try {

            const readStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: readStream,
                crlfDelay: Infinity
            })

            let count = 0;
            rl.on('line', (line) => {
                count ++;
            })

            rl.on('close', () => {
                resolve(count)
            })
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

export const fileNoExistToCreate = function(filePath: string): boolean {
    if (fs.existsSync(filePath)) {
        fs.writeFile(filePath, '', 'utf-8', () => {});
    }
    return false;
}