import * as dotenv from 'dotenv'
import Keyv from 'keyv'
import { isNotEmptyString } from './utils/is'

dotenv.config()

let storage: Keyv | null
if (isNotEmptyString(process.env.POSTGRES_URL) && isNotEmptyString(process.env.POSTGRES_TABLE)) {
  const keyvOpts = { table: process.env.POSTGRES_TABLE }
  storage = new Keyv(process.env.POSTGRES_URL, keyvOpts)
}

export default storage
