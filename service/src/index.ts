import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import storage from './store'

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json({limit: '50mb'}))

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'text/event-stream; charset=utf-8')

  try {
    const { prompt, options = {}, systemMessage, temperature, topP } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      topP,
    })
  }
  catch (error) {
    res.json(error)
  }
  finally {
    res.end()
  }
})

router.get('/v1/chat-storage', [auth, limiter], async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    const chat = await storage.get('v1-chat-storage') || {}
    res.json({ data: chat, status: 'Success' })
  }
  catch (error) {
    res.json(error)
  }
  finally {
    res.end()
  }
})

router.post('/v1/chat-storage', [auth, limiter], async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    if (storage == null) {
      res.json({ status: 'Success' })
      return
    }

    await storage.set('v1-chat-storage', req.body as Object)

    res.json({ status: 'Success' })
  }
  catch (error) {
    res.json(error)
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
