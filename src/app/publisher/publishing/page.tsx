import { getFacebookPublishMode } from "@/lib/publisher/facebook-publisher";
import PublishQueue from "./PublishQueue";

export default async function PublishingPage() {
  const facebookMode = await getFacebookPublishMode();
  return <PublishQueue facebookMode={facebookMode} />;
}
