import * as dotenv from 'dotenv'
import Keyv from 'keyv'
import { isNotEmptyString } from './utils/is'

dotenv.config()

const { messageStore, historyStore } = (() => {
  const ret = { messageStore: null, historyStore: null }
  const POSTGRES_URL = process.env.POSTGRES_URL
  const POSTGRES_TABLE_PREFIX = process.env.POSTGRES_TABLE_PREFIX

  if (isNotEmptyString(POSTGRES_URL) && isNotEmptyString(POSTGRES_TABLE_PREFIX)) {
    ret.messageStore = new Keyv(POSTGRES_URL, { table: `${POSTGRES_TABLE_PREFIX}_message` })
    ret.historyStore = new Keyv(POSTGRES_URL, { table: `${POSTGRES_TABLE_PREFIX}_history` })
  }
  return ret
})()

export { messageStore, historyStore }
