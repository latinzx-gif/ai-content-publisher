import { getBufferMode } from "@/lib/publisher/buffer-publisher";
import { getFacebookPublishMode } from "@/lib/publisher/facebook-publisher";
import PublishQueue from "./PublishQueue";

export default async function PublishingPage() {
  const [bufferMode, facebookMode] = await Promise.all([
    getBufferMode(),
    getFacebookPublishMode(),
  ]);
  return <PublishQueue bufferMode={bufferMode} facebookMode={facebookMode} />;
}
