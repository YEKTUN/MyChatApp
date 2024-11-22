import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    Alert,
  } from 'react-native';
  import React, {useState} from 'react';
  import Entypo from 'react-native-vector-icons/Entypo';
  import LinearGradient from 'react-native-linear-gradient';
  import auth from '@react-native-firebase/auth';
  import firestore from '@react-native-firebase/firestore';
  
  interface Props {
    modalVisible: boolean;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    getChatRooms: () => void;
  }
  
  const CreateChatRoom: React.FC<Props> = ({modalVisible, setModalVisible, getChatRooms}) => {
    const [roomName, setRoomName] = useState<string>('');
    const [roomEmail, setRoomEmail] = useState<string>('');
  
    const user = auth().currentUser;
    const email = user?.email;
  
    const searchNotFounderEmail = async (): Promise<boolean> => {
      try {
        const querySnapshot = await firestore()
          .collection('users')
          .where('email', '==', roomEmail)
          .get();
  
        if (querySnapshot.empty) {
          Alert.alert('Böyle bir kullanıcı yok');
          return false;
        } else {
          return true;
        }
      } catch (error) {
        console.error('Veri sorgulamada hata:', error);
        return false;
      }
    };
  
    const createChatRoom = async () => {
      if (email === roomEmail) {
        Alert.alert('Kendi email adresiniz ile oda oluşturamazsınız.');
        return;
      }
      try {
        const querySnapshot = await firestore()
          .collection('chatrooms')
          .where('founderEmail', '==', email&&roomEmail)
          .where('notFounderEmail', '==', roomEmail&&email)
         
          .get();
  
        if (querySnapshot.empty) {
          const userExists = await searchNotFounderEmail();
          if (!userExists) {
            Alert.alert('Geçersiz email, oda oluşturulmadı ');
            return;
          }
  
          await firestore()
            .collection('chatrooms')
            .add({
              files: [],
              name: roomName,
              notFounderEmail: roomEmail,
              founderEmail: email,
              founderMessages: [],
              notFounderMessages: [],
              createdAt: firestore.FieldValue.serverTimestamp()
            });
          setModalVisible(false);
          setRoomName('')
          setRoomEmail('')
          getChatRooms()
        } else {
          Alert.alert('Bu email ile zaten bir oda var.');
        }
      } catch (error: unknown) {
        let errorMessage = 'Bilinmeyen bir hata oluştu';
  
        if (error instanceof Error) {
          errorMessage = error.message;
        }
  
        Alert.alert('Oda oluşturma sırasında hata:', errorMessage);
      }
    };
  
    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center">
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
  
            <Text className="text-white font-bold text-[20px] mt-4">Oda Kur</Text>
            <TextInput
              numberOfLines={1}
              maxLength={30}
              textAlignVertical="top"
              placeholder="Oda adınızı giriniz"
              value={roomName}
              onChangeText={setRoomName}
              className="border-2 w-[200px] h-[50px] p-2 mt-2 rounded-lg"
            />
            <TextInput
              numberOfLines={1}
              maxLength={30}
              textAlignVertical="top"
              placeholder="E-mail giriniz"
              value={roomEmail}
              onChangeText={setRoomEmail}
              className="border-2 w-[200px] h-[50px] p-2 mt-2 rounded-lg"
            />
            <TouchableOpacity
              onPress={createChatRoom}
              className="border-2 w-[100px] h-[40px] justify-center items-center mt-10 rounded-full bg-slate-300">
              <Text className="text-black">Kur</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    );
  };
  
  export default CreateChatRoom;
  