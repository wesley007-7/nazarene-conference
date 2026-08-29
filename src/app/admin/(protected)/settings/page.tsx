import { prisma } from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  return (
    <div className="max-w-2xl bg-white p-8 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
      <SettingsForm initialData={settings} />
    </div>
  );
}

