import crypto from 'crypto'
import express from 'express'
import { apiMethods, apiServices } from './api'
import { getRouteHandler } from './utils'

let profileRouter
let cachedProfileHash

/**
 * Middleware that registers profile override responses
 * @returns {function}
 */
export function profileOverrideMiddleware (profile = null) {
  // Load intial profile
  if (profile) {
    apiMethods.load(profile)
  }

  return (req, res, next) => {
    profileRouter = getRouter()
    profileRouter(req, res, next)
  }
}

/**
 * Get router representing the currently loaded profile
 * @returns {Express router}
 */
function getRouter () {
  const profileHash = getProfileHash()
  if (profileHash === cachedProfileHash) {
    return profileRouter
  }

  // cache profile hash
  cachedProfileHash = profileHash

  // create new router
  const router = express.Router()
  Object.keys(apiServices.serviceOverrides)
    .forEach(url => {
      router.all(url, getOverrideHandler(apiServices.serviceOverrides[url]))
    })
  return router
}

/**
 * Get a hash of the currently loaded profile
 * @returns {string} - hash of current service overrides object
 */
function getProfileHash () {
  const hash = crypto.createHash('md5')
  hash.update(JSON.stringify(apiServices.serviceOverrides))
  return hash.digest('hex')
}

/**
 * Parse profile override and get route handler function
 * @param {object} override - profile override to parse
 * @returns {Express route} - route handler
 */
function getOverrideHandler ({ response, status }) {
  return getRouteHandler(response, status)
}
