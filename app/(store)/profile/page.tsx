import { getUser } from "@/modules/auth/auth-session";
import { getMyProfile } from "@/modules/profile/service/profil.service";
import { ProfileContent } from "@/modules/profile/components/profile-content";

export default async function ProfilePage() {
  const user = await getUser();
  const profileResult = await getMyProfile();

  return (
    <ProfileContent
      email={user?.email ?? ""}
      profile={profileResult.data}
    />
  );
}