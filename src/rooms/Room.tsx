import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MessageRoomModal from '../component/MessageRoomModal';
import { useNavigation } from '@react-navigation/native';
interface Props {
  founderEmail: string;
  notFounderEmail: string;
  roomName: string;
  noFounderPhoto: string;
  navigation: any;
  roomId: string;
  name: string;
  messageModalOption: boolean;
  setMessageModalOption: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedRoomId:React.Dispatch<React.SetStateAction<string>>
}

interface FounderMessage {
  founderMessage: string;
  founderCreatedAt: any;
  sender: any;
}

const Room: React.FC<Props> = ({
  noFounderPhoto,
  founderEmail,
  notFounderEmail,
  roomName,
  navigation,
  roomId,
  name,
  messageModalOption,
  setMessageModalOption,
  setSelectedRoomId
}) => {
  const user = auth().currentUser;

 



  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('SingleChatRoom', {
          notFounderEmail,
          roomName,
          roomId,
          founderEmail,
          noFounderPhoto,
          name,
        });
      }}
      onLongPress={() => {

        setMessageModalOption(true);
        setSelectedRoomId(roomId);
      }}
      className="flex-row justify-between items-center m-3 border-b-2 border-slate-300 pb-4">
      <Image
        className=" w-[70px] h-[70px] rounded-full "
        source={{
          uri:
            noFounderPhoto ||
            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        }}
      />
        
      <Text className="text-white absolute left-20 top-1">{name} </Text>
      <Text>{roomName}</Text>
     
    
   
   
    </TouchableOpacity>
  );
};

export default Room;
