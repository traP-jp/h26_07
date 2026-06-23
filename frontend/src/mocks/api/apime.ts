import { http } from '../http'

export const apime = [
  http.get('/api/me', ({ response }) => {
    return response(200).json({
      id: 'mumumu',
      name: 'mumumu',
    })
  }),
]

