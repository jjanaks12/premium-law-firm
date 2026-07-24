import { Router } from 'express';
import { catchAsync } from '@/utils/catchAsync';
import { validate } from '@/middlewares/validate';
import * as authController from './auth.controller';
import { registerSchema, loginSchema } from '@app/validations';

const route = Router();

route.post('/register', validate(registerSchema), catchAsync(authController.register));
route.post('/login', validate(loginSchema), catchAsync(authController.login));

export default route;
