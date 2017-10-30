import fs from 'fs'
import path from 'path'
import { serverError, serverLog } from '../log'
import {
  filterServices, services, serviceOverrides,
  setServiceOverride, resetServiceOverride,
  setAllServiceOverrides, resetAllServiceOverrides
} from './services'

export function block (serviceName, status = 404, response = {}) {
  filterServices(services, serviceName)
    .forEach(url => {
      serverLog(`blocking ${url} service with ${status} status`)
      setServiceOverride(url, { status, response })
    })
}

export function blockAll (status = 500, response = {}) {
  // TODO: all blocked needs to actually add all services
  serverLog('blocking all services')
}

export function reset (serviceName) {
  filterServices(serviceOverrides, serviceName)
    .forEach(url => {
      serverLog(`reseting ${url} service`)
      resetServiceOverride(url)
    })
}

export function resetAll () {
  serverLog('reseting all services')
  resetAllServiceOverrides()
}

export function show () {
  return Object.keys(serviceOverrides)
}

export function showAll () {
  return serviceOverrides
}

export function set (serviceName, config) {
  const { status } = config

  // TODO: set services that are not defined in service map

  filterServices(services, serviceName)
    .forEach(url => {
      serverLog(`setting override for ${url} service with ${status} status`)
      setServiceOverride(url, config)
    })
}

export function load (profileName) {
  resetAll()

  if (profileName) {
    serverLog(`loading ${profileName} profile`)
    try {
      let profilePath = profileName

      // Add json extension
      if (!profilePath.includes('.json')) {
        profilePath = `${profilePath}.json`
      }

      // Make path absolute
      if (!path.isAbsolute(profilePath)) {
        profilePath = path.join(profileDir, profilePath)
      }

      const fileData = fs.readFileSync(profilePath)
      const profileData = JSON.parse(fileData)
      setAllServiceOverrides(profileData)
    } catch (e) {
      serverError(`loading ${profileName} profile failed`)
    }
  }
}

