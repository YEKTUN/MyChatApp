import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import React ,{useState}from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
interface Props {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  about: string;
  setAbout: React.Dispatch<React.SetStateAction<string>>;
}
const AboutModal: React.FC<Props> = ({
  modalVisible,
  setModalVisible,
  about,
  setAbout,
}) => {
    const[aboutModal,setAboutModal]=useState<string>('')
  const user = auth().currentUser;
  const email = user?.email;

  const updateAbout = async () => {
    if (user) {
      try {
        await firestore().collection('users').doc(user.uid).update({about: aboutModal});
        
        setAbout(aboutModal);
        setModalVisible(false);
        setAboutModal('');
      } catch (error) {
        console.error('Error updating about: ', error);
      }
    }
  };
  

  return (
    <Modal
      className=""
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}>
      <View className="flex-1 justify-center items-center ">
        <LinearGradient
          colors={['#111111', '#222222', '#333333', '#444444']}
          className="w-[350px] h-[350px] bg-white rounded-full justify-start items-center">
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setModalVisible(false)}>
            <Entypo
              name="squared-cross"
              size={30}
              style={{color: '#FAAC51', marginTop: 20}}
            />
          </TouchableOpacity>
          
            <Text className='text-white font-bold text-[20px] mt-4'>About</Text>
          <TextInput multiline={true} numberOfLines={3} maxLength={100} textAlignVertical='top' placeholder="About" value={aboutModal} onChangeText={setAboutModal} className='border-2 w-[200px] h-[150px] p-2 mt-2 rounded-lg'/>
          <TouchableOpacity onPress={updateAbout}  className='border-2 w-[100px] h-[40px] justify-center items-center mt-10 rounded-full bg-slate-300 '>
            <Text className='text-black'>Update</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default AboutModal;
