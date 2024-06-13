/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
// import ProductController from '#controllers/Warehouse/product_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {

  router.post('/auth/login', [AuthController, 'login'])

  router.get('/user', [UsersController, 'index'])
  router.get('/user/:id', [UsersController, 'show']).middleware([middleware.auth()])
  router.post('/user', [UsersController, 'store']).middleware([middleware.auth()])
  router.put('/user/:id', [UsersController, 'update']).middleware([middleware.auth()])
  router.delete('/user/:id/delete', [UsersController, 'destroy']).middleware([middleware.auth()])

  // router.resource('/warehouse/products', ProductController)
}).prefix('api')