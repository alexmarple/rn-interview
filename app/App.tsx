/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import EditProfilePhotosScreen from './src/screens/EditProfilePhotosScreen';

import { colors } from './src/theme';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          backgroundColor: colors.background,
        }}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Edit Profile</Text>
          <Text style={styles.subheaderText}>Manage your photos</Text>
        </View>
        <EditProfilePhotosScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subheaderText: {
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default App;
