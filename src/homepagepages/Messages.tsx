import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CreateChatRoom from '../component/CreateChatRoom';
import RoomList from '../rooms/RoomList';
import MessageRoomModal from '../component/MessageRoomModal';

interface Props {
  navigation: any;
}
const Messages: React.FC<Props> = ({navigation}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [userData, setUserData] = useState<any | null>(null);
  const [message, setMessage] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Array<any>>([]);
  const [messageModalOption, setMessageModalOption] = useState<boolean>(false);
  const user = auth().currentUser;

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .doc(user?.uid)
      .onSnapshot(doc => {
        if (doc.exists) {
          setUserData(doc.data());
        } else {
          
        }
      });
  
    return () => unsubscribe();
  }, [user?.uid]);

  const getChatRooms = () => {
    if (!user?.email) {
      
      navigation.replace('LoginPage');
      return;
    }
    

    const roomsFound: any[] = [];

    const founderEmailQuery = firestore()
      .collection('chatrooms')
      .where('founderEmail', '==', user?.email)
      .get()
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          querySnapshot.docs.forEach(doc => {
            roomsFound.push({id: doc.id, ...doc.data()});
          });
        }
      });

    const notFounderEmailQuery = firestore()
      .collection('chatrooms')
      .where('notFounderEmail', '==', user?.email)
      .get()
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          querySnapshot.docs.forEach(doc => {
            roomsFound.push({id: doc.id, ...doc.data()});
          });
        }
      });

    // İki sorgunun tamamlandığında sonuçları güncelle
    Promise.all([founderEmailQuery, notFounderEmailQuery])
      .then(() => {
        if (roomsFound.length === 0) {
          
          setRooms([]);
          return;
        }

        
        setRooms(roomsFound);
      })
      .catch(error => {
        console.error('Error fetching chat rooms:', error);
      });
  };
  useEffect(() => {
    getChatRooms();
  }, [user?.email, messageModalOption,]);

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#123456', '#123444', '#123333', '#123222']}
        className="flex-1  ">
        <View
          style={{flex: 1}}
          className=" justify-between items-center flex flex-row border-b-2 border-blue-300">
          <Image
            source={{
              uri: userData?.photo ||  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            }}
            resizeMode="cover"
            className="w-[60px] h-[60px] rounded-full ml-5"
          />
          <Text className='text-white font-bold text-2xl mr-2'>{userData?.name}</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              marginRight: 20,
              borderRadius: 20,
              borderColor: 'white',
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesign name="plus" size={30} color="white" />
          </TouchableOpacity>
          <CreateChatRoom
            getChatRooms={getChatRooms}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
          />
        </View>
        <View style={{flex: 8}}>
          <FlatList
            data={rooms}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <RoomList
                messageModalOption={messageModalOption}
                setMessageModalOption={setMessageModalOption}
                roomId={item.id}
                navigation={navigation}
                roomName={item.name}
                founderEmail={item.founderEmail}
                notFounderEmail={item.notFounderEmail}
              />
            )}
          />
    
         
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Messages;
