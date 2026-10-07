export const getRoutedTeamMemberIdsFromSearchParams = (searchParams: URLSearchParams) => {
  const routedTeamMemberIdsParam = searchParams.get("cal.routedTeamMemberIds");
  if (typeof routedTeamMemberIdsParam !== "string") {
    return null;
  }
  const routedTeamMemberIds = routedTeamMemberIdsParam
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
  return Array.from(new Set(routedTeamMemberIds));
};
