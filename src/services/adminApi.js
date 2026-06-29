const BASE_URL = 'https://api.tayeh.ourgrid.dev'

export async function getAnalytics() {
  const response = await fetch(`${BASE_URL}/api/admin/analytics`)
  return response.json()
}

export async function getPlaces({ page = 1, sort = 'desc' } = {}) {
    const response = await fetch(`${BASE_URL}/api/admin/places?page=${page}&sort=${sort}`)
    return response.json()
}

export const uploadDxfFile = async (file) => {
    // waiting for alaa
}