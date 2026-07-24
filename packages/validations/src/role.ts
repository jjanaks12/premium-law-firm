import * as yup from 'yup';

export const roleSchema = yup.object().shape({
    name: yup.string().trim().required("Role name is required"),
    description: yup.string(),
    permissions: yup.object(),
});

export type RoleInput = yup.InferType<typeof roleSchema>