import { defineAbility } from '@casl/ability';

export enum USER_ROLE {
    ADMIN = 'admin',
    USER = 'user',
  }

export default defineAbility((can) => {
//admin
 can(USER_ROLE.ADMIN,'delete');
});
