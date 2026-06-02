import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../../database/entities';

export const Roles = (...roles: RoleName[]) => SetMetadata('roles', roles);
