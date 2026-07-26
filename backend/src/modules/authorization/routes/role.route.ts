import { Router } from 'express';

import { verifyAccessToken } from '@/middlewares/checkAuth';
import { can } from '@/middlewares/checkPermission';
import * as RoleController from '../controller/role.controller';
import * as PermissionController from '../controller/permission.controller'

const route = Router();

route.get('/', [verifyAccessToken, can('roles', 'list')], RoleController.index);
route.get('/permissions', [verifyAccessToken, can('roles', 'read')], PermissionController.index);
route.get('/:id', [verifyAccessToken, can('roles', 'read')], RoleController.show);
route.post('/', [verifyAccessToken, can('roles', 'create')], RoleController.store);
route.put('/:id', [verifyAccessToken, can('roles', 'update')], RoleController.update);
route.delete('/:id', [verifyAccessToken, can('roles', 'delete')], RoleController.destroy);

export default route;
