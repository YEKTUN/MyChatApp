import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    Alert,
  } from 'react-native';
  import React ,{useState}from 'react';
  import Entypo from 'react-native-vector-icons/Entypo';
  import LinearGradient from 'react-native-linear-gradient';
  import auth from '@react-native-firebase/auth';
  import firestore from '@react-native-firebase/firestore';
  interface Props {
    telModalVisible: boolean;
    setTelModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    tel: string;
    setTel: React.Dispatch<React.SetStateAction<string>>;
  }
  const TelModal: React.FC<Props> = ({
    telModalVisible,
    setTelModalVisible,
    tel,
    setTel,
  }) => {
      const[telModal,setTelModal]=useState<string>('')
    const user = auth().currentUser;
    const email = user?.email;
  
    const updateTel = async () => {
        if (validateTel(telModal)) {
          
            if (user) {
              try {
                await firestore().collection('users').doc(user.uid).update({tel: telModal});
                console.log('User about updated!');
                setTel(telModal);
                setTelModalVisible(false);
                setTelModal('');
              } catch (error) {
                console.error('Error updating about: ', error);
              }
            }
        }else{
           Alert.alert("Tel is not valid")
        }
    };
    const validateTel = (text: string) => {

      const regex=/^(?:\+90.?5|0090.?5|905|0?5)(?:[01345][0-9])\s?(?:[0-9]{3})\s?(?:[0-9]{2})\s?(?:[0-9]{2})$/
      return regex.test(text);
    };
    
  
    return (
      <Modal
        className=""
        visible={telModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTelModalVisible(false)}>
        <View className="flex-1 justify-center items-center ">
          <LinearGradient
            colors={['#111111', '#222222', '#333333', '#444444']}
            className="w-[350px] h-[350px] bg-white rounded-full justify-start items-center">
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => setTelModalVisible(false)}>
              <Entypo
                name="squared-cross"
                size={30}
                style={{color: '#FAAC51', marginTop: 20}}
              />
            </TouchableOpacity>
            
              <Text className='text-white font-bold text-[20px] mt-4'>TEL</Text>
            <TextInput key={tel} keyboardType='numeric'  maxLength={11} textAlignVertical='top' placeholder="Tel" value={telModal} onChangeText={setTelModal} className='border-2 w-[200px] h-[150px] p-2 mt-2 rounded-lg'/>
            <TouchableOpacity onPress={updateTel}  className='border-2 w-[100px] h-[40px] justify-center items-center mt-10 rounded-full bg-slate-300 '>
              <Text className='text-black'>Update</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    );
  };
  
  export default TelModal;
  