import DashboardLayout from '../../components/DashboardLayout';
import Messages from '../messages';

export default function EmployerMessages() {
  return (
    <DashboardLayout>
      <Messages isEmbedded={true} />
    </DashboardLayout>
  );
}
