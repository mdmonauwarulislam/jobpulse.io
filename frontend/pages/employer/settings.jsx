import DashboardLayout from '../../components/DashboardLayout';
import Settings from '../settings';

export default function EmployerSettings() {
  return (
    <DashboardLayout>
      <Settings isEmbedded={true} />
    </DashboardLayout>
  );
}
