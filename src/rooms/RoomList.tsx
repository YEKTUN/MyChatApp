import {View, Text, Pressable, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import Room from './Room';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MessageRoomModal from '../component/MessageRoomModal';

interface Props {
  founderEmail: string;
  notFounderEmail: string;
  roomName: string;
  navigation: any;
  roomId: string;
  messageModalOption: boolean;
  setMessageModalOption: React.Dispatch<React.SetStateAction<boolean>>;
}

const RoomList: React.FC<Props> = ({
  roomId,
  navigation,
  roomName,
  founderEmail,
  notFounderEmail,
  messageModalOption,
  setMessageModalOption,
}) => {
  const [noFounderPhoto, setNoFounderPhoto] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const user = auth().currentUser;

  const getPhoto = async (notFounderEmail: string): Promise<void> => {
    try {
      if (user?.email === founderEmail || user?.email === notFounderEmail) {
        const otherEmail =
          user?.email === founderEmail ? notFounderEmail : founderEmail;
        const querySnapshot = await firestore()
          .collection('users')
          .where('email', '==', otherEmail)
          .get();

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const photo = doc.data().photo;
          setNoFounderPhoto(photo);
          setName(doc.data().name);
        } else {
        }
      }
    } catch (error) {
      console.error('Error fetching photo:', error);
    }
  };
  

  useEffect(() => {
    getPhoto(notFounderEmail);
  }, [notFounderEmail, founderEmail, user?.email]);
  return (
    <View>
      <Room
        messageModalOption={messageModalOption}
        setMessageModalOption={setMessageModalOption}
        roomId={roomId}
        navigation={navigation}
        roomName={roomName}
        noFounderPhoto={noFounderPhoto}
        founderEmail={founderEmail}
        notFounderEmail={notFounderEmail}
        name={name}
        setSelectedRoomId={setSelectedRoomId}
      />
       {messageModalOption && selectedRoomId === roomId  && ( // Sadece tıklanan odanın modalını göster
        <MessageRoomModal
          roomId={roomId}
          messageModalOption={messageModalOption}
          setMessageModalOption={setMessageModalOption}
          selectedRoomId={selectedRoomId}
          setSelectedRoomId={setSelectedRoomId}
          roomName={roomName}
        />
      )}
     
    </View>
  );
};

export default RoomList;
