import {
  View,
  Text,
  
  TextInput,
 
  TouchableHighlight,
  Alert,
  Pressable,
} from 'react-native';
import React,{useState,useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface Props {
  navigation: any;
}
const LoginPage: React.FC<Props> = ({navigation}) => {
  const[password,setPassword]=useState<string>("")
  const[email,setEmail]=useState<string>("")
 
  const login = async () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(async userCredential => {
        await AsyncStorage.setItem('loginTime', Date.now().toString());
        Alert.alert('User logged in successfully');
        navigation.replace('HomePage');
      })
      .catch(error => {
        Alert.alert(error.message);
      });
  };
  const checkSession = async () => {
    const loginTime = await AsyncStorage.getItem('loginTime');
    if (loginTime) {
      const timeDifference = Date.now() - parseInt(loginTime, 10);
      const sessionDuration = 24 * 60 * 60 * 1000; // Örneğin, 24 saatlik süre
  
      if (timeDifference > sessionDuration) {
        // Oturum süresi dolmuşsa çıkış yap
        auth().signOut();
        navigation.replace('LoginPage');
      }
    }
  };
  useEffect(() => {
    checkSession();
  }, []);
  
  return (
    <SafeAreaView className="flex-1 justify-end bg-black   items-center">
      <View  className="w-full h-3/4 border-t-2 border-r-2 border-l-2 gap-y-4 rounded-tr-[50px] rounded-tl-[50px]  border-white justify-center  items-center " >
      <Text className='text-slate-300 font-bold text-xl absolute top-10'>LOGİN</Text>
        <View  className='w-3/4'>
          <Ionicons
            name="person-circle-sharp"
            size={25}
            color="white"
            style={{position: 'absolute', top: 15, left: 10}}
          />
          <TextInput
           autoCapitalize='none'
          value={email}
          onChangeText={setEmail}
            placeholderTextColor={'gray'}
            className=" w-full border-2 border-white placeholder-red rounded-full pl-12"
            placeholder="E-mail"
          />
        </View>
        <View className='w-3/4'>
          <AntDesign
            name="lock"
            size={25}
            color="white"
            style={{position: 'absolute', top: 15, left: 10}}
          />
          <TextInput
          secureTextEntry
           autoCapitalize='none'
          value={password}
          onChangeText={setPassword}
            placeholderTextColor={'gray'}
            className=" w-full border-2 border-white placeholder-red rounded-full pl-12"
            placeholder="Password"
          />
        </View>
        <View className="w-full  items-center gap-y-2">
          <TouchableHighlight
            underlayColor="#342E37"
            className="bg-white rounded-full w-1/2 h-[35px] justify-center items-center  transition-all duration-300"
            onPress={login}>
            <Text className="text-black font-bold active:text-white  ">GİRİŞ</Text>
          </TouchableHighlight>
          <Pressable onPress={() => navigation.navigate('SignupPage')}  className=' active:opacity-50 '>
              <Text className="text-white text-[12px]">Do you have a account or sign up?</Text>
            </Pressable>
         
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginPage;
