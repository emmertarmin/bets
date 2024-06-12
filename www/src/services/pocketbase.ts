// import PocketBase from 'pocketbase'

// export const pb = new PocketBase('https://bets.emmert.hu/pb')

export const pbFetch = async (url: string, options: any, pbToken?: string) => {
  // prune leading slash
  url = url.replace(/^\/+/, '')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  if (pbToken) {
    const cookieParams = new URLSearchParams(pbToken)
    const token = cookieParams.get('token')
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch('https://bets.emmert.hu/pb/' + url, {
    ...options,
    headers
  })

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: await response.json()
  }
}

export const pbGET = async (url: string, query: any, pbToken?: string) => {
  if (query) {
    url += '?' + new URLSearchParams(query).toString()
  }
  return await pbFetch(url, { method: 'GET' }, pbToken)
}

export const pbPOST = async (url: string, data: any, pbToken?: string) => {
  return await pbFetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }, pbToken)
}

export const pbPUT = async (url: string, data: any, pbToken?: string) => {
  return await pbFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, pbToken)
}

export const pbPATCH = async (url: string, data: any, pbToken?: string) => {
  return await pbFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }, pbToken)
}

export const pbDELETE = async (url: string, pbToken: string) => {
  return await pbFetch(url, { method: 'DELETE' }, pbToken)
}