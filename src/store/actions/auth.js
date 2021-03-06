import axios from 'axios'
import { AUTH_SUCCESS, AUTH_ERROR, AUTH_LOGOUT } from './actionTypes'
import { saveFavouriteBeer, fetchFavouriteBeer } from './favourite.js'

export function auth(email, password, isLogin) {
  return async dispatch => {
    const authData = {
      email, password,
      returnTokenSecure: true
    }

    let url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBG4WdpnmXDk7PjkCnv7HsYMrLqIpkfqi0'

    if (isLogin) {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBG4WdpnmXDk7PjkCnv7HsYMrLqIpkfqi0'
    }

    try {
      const response = await axios.post(url, authData)
      const data = response.data

      const expiresTime = 3600;
      const expirationDate = new Date(new Date().getTime() + expiresTime * 1000)

      localStorage.setItem('token', data.idToken)
      localStorage.setItem('userId', data.localId)
      localStorage.setItem('expirationDate', expirationDate)

      dispatch(authSuccess(data.idToken))
      dispatch(autoLogout(expiresTime))
      dispatch(fetchFavouriteBeer())
    } catch {
      isLogin
        ? dispatch(authError('Email or password is not correct'))
        : dispatch(authError('Your email address is already registered'))
    }
  }
}

export function authError(message) {
  return {
    type: AUTH_ERROR,
    message
  }
}

export function authSuccess(token) {
  return {
    type: AUTH_SUCCESS,
    token
  }
}

export function autoLogout(expiresTime) {
  return dispatch => {
    setTimeout(() => {
      dispatch(saveFavouriteBeer())
      dispatch(logout())
    }, expiresTime * 1000)
  }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('expirationDate')

  return {
    type: AUTH_LOGOUT
  }
}

export function autoLogin() {
  return dispatch => {
    const token = localStorage.getItem('token')
    if (!token) {
      dispatch(logout())
    } else {
      const expirationDate = new Date(localStorage.getItem('expirationDate'))

      if (expirationDate <= new Date()) {
        dispatch(logout())
      } else {
        dispatch(authSuccess(token))
        dispatch(autoLogout((expirationDate.getTime() - new Date().getTime()) / 1000))
      }
    }
  }
}
