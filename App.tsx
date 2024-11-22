import React,{useState,useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginPage from './src/pages/LoginPage';
import HomePage from './src/pages/HomePage';
import SignupPage from './src/pages/SignupPage';
import SingleChatRoom from './src/homepagepages/SingleChatRoom';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

type RootStackParamList = {
  HomePage: undefined;
  LoginPage: undefined;
  SignupPage: undefined;
  SingleChatRoom: {
    notFounderEmail: string;
    roomName: string;
  };
};
interface Props{
  navigation:any
}


const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC<Props> = ({navigation}) => {
  const [initialRoute, setInitialRoute] = useState<'HomePage' | 'LoginPage'>('LoginPage');

  const checkSession = async () => {
    const loginTime = await AsyncStorage.getItem('loginTime');
    if (loginTime) {
      const timeDifference = Date.now() - parseInt(loginTime, 10);
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 saat

      if (timeDifference <= sessionDuration) {
        setInitialRoute('HomePage');
      } else {
        await auth().signOut();
        setInitialRoute('LoginPage');
      }
    } else {
      setInitialRoute('LoginPage');
    }
  };

  useEffect(() => {
    checkSession();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="HomePage"
          component={HomePage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="LoginPage"
          component={LoginPage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignupPage"
          component={SignupPage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SingleChatRoom"
          component={SingleChatRoom}
          options={({route}) => ({
            title: route.params.roomName || 'Chat Room',
            headerTitleAlign: 'center',
            headerStyle: {backgroundColor: '#96A6A8'},
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
