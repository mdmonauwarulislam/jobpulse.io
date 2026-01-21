import DashboardLayout from '../../components/DashboardLayout';
import Settings from '../settings';
import { withAuth } from '../../utils/withAuth';

function UserSettings() {
  return (
    <DashboardLayout>
      <Settings isEmbedded={true} />
    </DashboardLayout>
  );
}

export default withAuth(UserSettings, {
  requiredUserType: 'user',
  redirectTo: '/auth/login'
});
