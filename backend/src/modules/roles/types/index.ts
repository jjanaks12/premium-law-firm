export interface ICreateRole {
  name: string;
  description?: string;
  coreUser?: boolean;
  isActive?: boolean;
  permissions?: Record<string, string[]>;
}
export interface IUpdateRole extends Partial<ICreateRole> {}
