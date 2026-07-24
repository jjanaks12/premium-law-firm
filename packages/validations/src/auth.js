import * as yup from 'yup';
export const registerSchema = yup.object({
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
});
export const loginSchema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
});
