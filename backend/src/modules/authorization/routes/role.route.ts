import { Router } from 'express';

import { verifyAccessToken } from '@/middlewares/checkAuth';
import * as RoleController from '../controller/role.controller';
import * as PermissionController from '../controller/permission.controller'

const route = Router();

route.get('/', [verifyAccessToken], RoleController.index);
route.get('/permissions', [verifyAccessToken], PermissionController.index)
route.get('/:id', [verifyAccessToken], RoleController.show);
route.post('/', [verifyAccessToken], RoleController.store);
route.put('/:id', [verifyAccessToken], RoleController.update);
route.delete('/:id', [verifyAccessToken], RoleController.destroy);

export default route;
