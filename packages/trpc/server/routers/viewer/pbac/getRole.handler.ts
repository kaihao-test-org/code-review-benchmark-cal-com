import { FeaturesRepository } from "@calcom/features/flags/features.repository";
import { RoleType } from "@calcom/features/pbac/domain/models/Role";
import { PermissionCheckService } from "@calcom/features/pbac/services/permission-check.service";
import { RoleService } from "@calcom/features/pbac/services/role.service";
import { MembershipRole } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import { TRPCError } from "@trpc/server";

import type { TGetRoleInputSchema } from "./getRole.schema";

type GetRoleOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetRoleInputSchema;
};

export const getRoleHandler = async ({ ctx, input }: GetRoleOptions) => {
  const featureRepo = new FeaturesRepository();
  const teamHasPBACFeature = await featureRepo.checkIfTeamHasFeature(input.teamId, "pbac");

  if (!teamHasPBACFeature) {
    throw new TRPCError({ code: "FORBIDDEN", message: "PBAC is not enabled for this team" });
  }

  const permissionCheckService = new PermissionCheckService();
  const hasPermission = await permissionCheckService.checkPermission({
    userId: ctx.user.id,
    teamId: input.teamId,
    permission: "role.read",
    fallbackRoles: [MembershipRole.OWNER, MembershipRole.ADMIN],
  });

  if (!hasPermission) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to view roles" });
  }

  const roleService = new RoleService();
  const role = await roleService.getRole(input.roleId);

  if (!role || (role.type !== RoleType.SYSTEM && role.teamId !== input.teamId)) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
  }

  return role;
};
