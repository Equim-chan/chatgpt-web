import * as dotenv from 'dotenv'
import Keyv from 'keyv'
import { isNotEmptyString } from './utils/is'

dotenv.config()

let messageStore: Keyv | null
let historyStore: Keyv | null

const POSTGRES_URL = process.env.POSTGRES_URL
const POSTGRES_TABLE_PREFIX = process.env.POSTGRES_TABLE_PREFIX

if (isNotEmptyString(POSTGRES_URL) && isNotEmptyString(POSTGRES_TABLE_PREFIX)) {
  messageStore = new Keyv(POSTGRES_URL, { table: `${POSTGRES_TABLE_PREFIX}_message` })
  historyStore = new Keyv(POSTGRES_URL, { table: `${POSTGRES_TABLE_PREFIX}_history` })
}

export { messageStore, historyStore }
