import { join } from 'desm'
import envSchema from 'env-schema'
import S from 'fluent-json-schema'

const schema = S.object()
  .prop('FIREBASE_API_KEY', S.string().required())
  .prop('FIREBASE_APP_ID', S.string().required())
  .prop('FIREBASE_AUTH_DOMAIN', S.string().required())
  .prop('FIREBASE_RTDB_URL', S.string().required())
  .prop('FIREBASE_PROJECT_ID', S.string().required())
  .prop('HOST', S.string().default('0.0.0.0'))
  .prop('PORT', S.number().default(8080))
  .prop('LOG_LEVEL', S.string().default('info'))
  .prop('PRETTY_PRINT', S.string().default(false))

export default envSchema({
  schema,
  dotenv: { path: join(import.meta.url, '.env') }
})
