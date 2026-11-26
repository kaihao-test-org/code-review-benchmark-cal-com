import { markdownToSafeHTML } from "@calcom/lib/markdownToSafeHTML";

type UserBioCardProps = {
  name: string;
  bio: string;
};

export function UserBioCard({ name, bio }: UserBioCardProps) {
  return (
    <div className="flex flex-col gap-2" data-testid="user-bio-card">
      <h2 className="text-emphasis text-lg font-semibold">{name}</h2>
      <div className="text-subtle text-sm" dangerouslySetInnerHTML={{ __html: markdownToSafeHTML(bio) }} />
    </div>
  );
}

export default UserBioCard;
