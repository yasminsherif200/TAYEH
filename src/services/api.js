const BASE_URL = 'https://api.tayeh.ourgrid.dev'

export async function sendMessage(message, lat, lng) {
  const formData = new FormData()
  formData.append('message', message)
  formData.append('lat', lat)
  formData.append('lng', lng)

  const response = await fetch(`${BASE_URL}/api/search`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  return data
}