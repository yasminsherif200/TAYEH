const BASE_URL = 'https://api.tayeh.ourgrid.dev'

export async function getAnalytics() {
  const response = await fetch(`${BASE_URL}/api/admin/analytics`)
  return response.json()
}

export async function getPlaces({ page = 1, sort = 'desc' } = {}) {
    const response = await fetch(`${BASE_URL}/api/admin/places?page=${page}&sort=${sort}`)
    return response.json()
}

export async function uploadDxfFile(file) {
    const formData = new FormData()
    formData.append('file', file)
  
    const response = await fetch(`${BASE_URL}/api/extract-nav`, {
      method: 'POST',
      body: formData,
    })
  
    const data = await response.json()
  
    if (!response.ok || data.status >= 400) {
      throw new Error(data.message || 'Upload failed')
    }
  
    return data
  }