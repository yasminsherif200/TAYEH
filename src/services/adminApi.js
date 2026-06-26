const BASE_URL = 'https://api.tayeh.ourgrid.dev'
 
export async function getAnalytics() {
  const response = await fetch(`${BASE_URL}/api/admin/analytics`)
  return response.json()
}