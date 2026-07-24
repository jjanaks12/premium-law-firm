import * as yup from 'yup';

export const userInviteSchema = yup.object({
  first_name: yup.string().trim().required("First name is required"),
  last_name: yup.string().trim().required("Last name is required"),
  email: yup.string().trim().email("Invalid email address").required("Email is required"),
  role_id: yup.string().required("Role is required"),
});

export const acceptInvitationSchema = yup.object({
  token: yup.string().required("Invitation token is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export type UserInviteInput = yup.InferType<typeof userInviteSchema>;
export type AcceptInvitationInput = yup.InferType<typeof acceptInvitationSchema>;
