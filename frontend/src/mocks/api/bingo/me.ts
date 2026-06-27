import { http } from '../../http'
import { currentUser } from './core'

export const meHandlers = [
  http.get('/api/me', ({ request, response }) => {
    return response(200).json(currentUser(request))
  }),
]
