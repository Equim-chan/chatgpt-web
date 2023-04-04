import { readFileSync } from "fs"
import * as argon2 from "argon2"

const userMap: Map<string, string> = new Map()

const PASSWD_FILE = process.env.PASSWD_FILE
if (PASSWD_FILE) {
  const passwd_file = readFileSync(PASSWD_FILE, { encoding: 'utf-8' })
  for (let line of passwd_file.trim().split('\n')) {
    line = line.trim()
    if (line.startsWith('#')) {
      continue
    }
    const [username, hash] = line.split(':')
    userMap.set(username, hash)
  }
}

function hasAuth() {
  return userMap.size > 0
}

async function checkAndGetUsername(token) {
  try {
    const [username, password] = token.split(':')
    if (!hasAuth()) {
      return username
    }
    const hash = userMap.get(username)
    if (hash != null && await argon2.verify(hash, password)) {
      return username
    }
  }
  catch (error) {}
  return null
}

async function auth(req, res, next) {
  if (hasAuth()) {
    try {
      // actually should be Basic instead of Bearer but I'm lazy
      const token = req.header('Authorization')?.replace('Bearer ', '').trim()
      const verifiedUsername = await checkAndGetUsername(token)
      if (verifiedUsername == null) {
        throw new Error('Error: 无访问权限 | No access rights')
      }
      res.locals.username = verifiedUsername
      next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

export { auth, checkAndGetUsername, hasAuth }
