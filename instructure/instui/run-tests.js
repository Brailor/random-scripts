#!/usr/bin/env node

const path = require('node:path')
const fsp = require('node:fs/promises')
const child_proc = require('node:child_process')

async function readBuffer() {
  return fsp.readFile(path.resolve('./test-buffer.json'))
}

let buffer = []
async function main(ignores = []) {
  let dir = await fsp.opendir(path.resolve('./packages'))

  for await (let dirent of dir) {
    if (ignores.includes(dirent.name)) {
      continue
    }
    const dir_path = `./packages/${dirent.name}`
    let res = child_proc.spawnSync('yarn', ['test', '--path', dir_path], {
      stdio: 'inherit'
    })
    if (res.status !== 0) {
      throw new Error(
        `Test suite failed for package ${dirent.name}\n Original error: ${res.error.message}\n Stack: ${res.error.stack}`,
        {
          cause: res.error.cause
        }
      )
    } else {
      buffer.push(dirent.name)
    }
  }
}

;(async function run() {
  let buf = JSON.parse(await readBuffer())
  console.log({ buf })
  console.log('started to run every test suite for the packages...')
  main(buf)
    .catch((e) => {
      console.error(e)
    })
    .finally(async () => {
      //write to the buffer.json
      await fsp.writeFile(
        path.resolve('./test-buffer.json'),
        JSON.stringify([...buf, ...buffer])
      )
    })
})()
