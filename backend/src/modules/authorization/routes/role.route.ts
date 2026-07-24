import { Router } from 'express';
import { index } from '../controller/role.controller';
const route = Router();

route.get('/', index)

export default route;
