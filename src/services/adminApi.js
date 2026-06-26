const BASE_URL = 'https://api.tayeh.ourgrid.dev'

export async function getAnalytics() {
  const response = await fetch(`${BASE_URL}/api/admin/analytics`)
  const data = await response.json()
  return data.data
}