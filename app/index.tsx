import { Redirect } from 'expo-router';
import { useSession } from './(context)/AuthContext';

export default function IndexPage() {
  const { session, isLoading } = useSession();

  if (isLoading) return null;

  if (session) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/sign-in" />;
  }
}
