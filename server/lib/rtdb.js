import admin from 'firebase-admin'
import { applicationDefault } from 'firebase-admin/app'
import { child, push, ref, remove, set, update } from 'firebase/database'

export class RealtimeDatabaseClient {
  constructor(db) {
    this.db = db
  }

  static init() {
    try {
      const app = admin.initializeApp({
        credential: applicationDefault(),
        databaseURL: process.env.FIREBASE_RTDB_URL
      })

      return new RealtimeDatabaseClient(app.database())
    } catch (error) {
      console.error(error)
      throw new Error('Failed to initialise realtime database')
    }
  }

  /**
   * Delete a document from a given bucket
   * @param {string} bucket path to object within which the target document exists
   * @param {uuid} id ID of document to delete
   * @returns {Promise<void>}
   */
  delete(bucket, id) {
    if (!bucket || !id) {
      throw new Error('bucket & id must be provided')
    }

    return remove(ref(this.db, `${bucket}/${id}`))
  }

  /**
   * Create/update a document in a given bucket
   * @param {string} target path to object within which the document should be created/updated
   * @param {object | string} value values for the target document
   * @returns {Promise<object | string>}
   */
  async insert(target, value) {
    if (!target || (value !== null && !value)) {
      throw new Error('target & value must be provided')
    }

    set(ref(this.db, target), value)

    return value
  }

  /**
   * Append a value to an existing bucket
   * @param {string} bucket bucket to push to
   * @param {object | string} value value to push
   * @returns {Promise<object | string>}
   */
  async push(bucket, value) {
    if (!bucket || !value) {
      throw new Error('bucket & value must be provided')
    }

    push(child(ref(this.db), bucket), value)

    return value
  }

  /**
   * Update a document in a given bucket
   * @param {string} target path to object within which the update should be made
   * @param {object | string} value new value
   * @returns {Promise<object | string>}
   */
  async update(target, value) {
    if (!target || !value) {
      throw new Error('target & value must be provided')
    }

    update(ref(this.db), { [target]: value })
  }
}
