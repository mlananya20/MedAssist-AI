import { getToken } from './auth'

const BASE_URL = 'http://localhost:5000/api'

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseOrThrow(res, fallbackMessage) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || fallbackMessage)
  return data
}

export async function register(payload) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseOrThrow(res, 'Registration failed')
}

export async function login(payload) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseOrThrow(res, 'Login failed')
}

export async function predictDisease(symptoms) {
  const res = await fetch(`${BASE_URL}/predict/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ symptoms }),
  })
  return parseOrThrow(res, 'Prediction request failed')
}

export async function saveProfile(profile) {
  const res = await fetch(`${BASE_URL}/profile/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(profile),
  })
  return parseOrThrow(res, 'Profile save failed')
}

export async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/profile/`, {
    headers: authHeaders(),
  })
  return parseOrThrow(res, 'Could not load profile')
}

export async function fetchHistory({ disease, search } = {}) {
  const params = new URLSearchParams()
  if (disease) params.set('disease', disease)
  if (search) params.set('search', search)
  const res = await fetch(`${BASE_URL}/history/?${params.toString()}`, {
    headers: authHeaders(),
  })
  return parseOrThrow(res, 'Could not load history')
}
