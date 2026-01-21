import DashboardLayout from '../../components/DashboardLayout';
import Notifications from '../notifications';

export default function EmployerNotifications() {
  return (
    <DashboardLayout>
      <Notifications isEmbedded={true} />
    </DashboardLayout>
  );
}
