import {
  View,
  Text,
  StatusBar,
  TextInput,
  Button,
  TouchableHighlight,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import auth, { updateProfile } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
interface Props {
  navigation: any;
}
const SignupPage: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const[surname,setSurname]=useState<string>('')
  const[about,setAbout]=useState<string>('')
  const[tel,setTel]=useState<string>('')
  const[photo,setPhoto]=useState<string>('')
interface registerProps {
  name: string;
  surname: string;
  email: string;
  about: string;
  tel: string;
  photo: string;
}
const saveUserToDatabase = async (uid: string, userData: registerProps) => {
  try {
    await firestore().collection('users').doc(uid).set(userData);
  } catch (error) {
    console.log(error);
    
  }
}
  const signup = async(email:string,password:string) => {
    try {
      if (password !== confirmPassword) {
        Alert.alert('Password does not match');
        return;
      }
      if(email==''||password==''||confirmPassword==''||name==''||surname==''){
        Alert.alert('Please fill all the fields');
        return;
      }
       const userCredential=await auth()
        .createUserWithEmailAndPassword(email, password)
        
      const user = userCredential.user;
      await user.updateProfile({
        displayName: name + ' ' + surname,
        photoURL: photo,
        
      })
      Alert.alert(`${name} Succesfully registered`);
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setName('')
      setSurname('')
      navigation.goBack()
      await saveUserToDatabase(user.uid,{name:name,surname:surname,email:email,about:about,tel:tel,photo:photo});
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Signup Error', error.message);
      } else {
        Alert.alert('Signup Error', 'An unknown error occurred.');
      }
    }

      
  };
  return (
    <SafeAreaView className="flex-1 justify-end bg-black   items-center">
      <View className="w-full h-3/4 border-t-2 border-r-2 border-l-2 gap-y-4 rounded-tr-[50px] rounded-tl-[50px]  border-white justify-center  items-center ">
        <Text className="text-slate-300 font-bold text-xl absolute top-10">
          REGISTER
        </Text>
        

        <View className="w-3/4">
          <AntDesign
            name="mail"
            size={25}
            color="white"
            
            style={{position: 'absolute', top: 15, left: 10}}
          />
          <TextInput
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={'gray'}
            className=" w-full border-2 border-white placeholder-red rounded-full pl-12"
            placeholder="E-mail"
          />
        </View>
        <View className="w-3/4">
          <AntDesign
            name="lock"
            size={25}
            color="white"
            style={{position: 'absolute', top: 15, left: 10}}
          />
          <TextInput
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={'gray'}
            className=" w-full border-2 border-white placeholder-red rounded-full pl-12"
            placeholder="Password"
          />
        </View>
        <View className="w-3/4">
          <AntDesign
            name="lock"
            size={25}
            color="white"
            style={{position: 'absolute', top: 15, left: 10}}
          />
          <TextInput
            secureTextEntry
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor={'gray'}
            className=" w-full border-2 border-white placeholder-red rounded-full pl-12"
            placeholder="Confirm Password"
          />
        </View>
        <View className="w-3/4">
          <AntDesign
            name="user"
            size={25}
            color="white"
            style={{position: 'absolute', top: 15, left: 10}}
          />
          <TextInput
            autoCapitalize="none"
            value={name}
            onChangeText={setName}
            placeholderTextColor={'gray'}
            className=" w-full border-2 border-white placeholder-red rounded-full pl-12"
            placeholder="Name"
          />
        </View>
        <View className="w-3/4">
          <AntDesign
            name="user"
            size={25}
            color="white"
            style={{position: 'absolute', top: 15, left: 10}}
          />
          <TextInput
            autoCapitalize="none"
            value={surname}
            onChangeText={setSurname}
            placeholderTextColor={'gray'}
            className=" w-full border-2 border-white placeholder-red rounded-full pl-12"
            placeholder="Surname"
          />
        </View>
        <View className="w-full items-center flex-row gap-x-2  border-white justify-center ">
          <TouchableHighlight
          onPress={() => signup(email,password)}
            underlayColor="#342EE7"
            className="bg-white rounded-full w-1/2 h-[35px] justify-center items-center transition-all duration-300"
            >
            <Text className="text-black font-bold  ">KAYIT OL</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'#3C3A3D'}
            onPress={() => navigation.goBack()}
            className="w-[40px] h-[40px] border-2 rounded-full border-white justify-center items-center">
            <Text>Geri</Text>
          </TouchableHighlight>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignupPage;
