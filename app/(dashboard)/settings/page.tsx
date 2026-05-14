import { getSettings } from "@/lib/actions/settings";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Company Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
