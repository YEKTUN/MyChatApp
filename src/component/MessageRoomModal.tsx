import {
  View,
  Text,
  Modal,
  Touchable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  BackHandler,
  Alert,
} from 'react-native';
import React, {useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
interface Props {
  messageModalOption: boolean;
  setMessageModalOption: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedRoomId: React.Dispatch<React.SetStateAction<string>>;
  selectedRoomId: string;
  roomName: string;

  roomId: string;
}
const user = auth().currentUser;
const MessageRoomModal: React.FC<Props> = ({
  messageModalOption,
  setMessageModalOption,
  roomId,
  setSelectedRoomId,
  selectedRoomId,
  roomName,
}) => {
  const deleteMessageRoom = () => {
    firestore()
      .collection('chatrooms')
      .doc(selectedRoomId)
      .delete()
      .then(() => {
        Alert.alert(`${roomName} deleted successfully`);
        setMessageModalOption(false);
      })
      .catch(error => {
        console.error('Error deleting room:', error);
      });
  };

  return (
    <Modal
      visible={messageModalOption}
      transparent
      animationType="fade"
      className="flex-1    w-full h-screen justify-center items-center gap-y-4">
      <TouchableWithoutFeedback
        className="h-[300px] w-[300px] border-2"
        onPress={() => {
          setSelectedRoomId('');
          setMessageModalOption(false);
        }}>
        <View className="flex-1 justify-center items-center">
          <View className="h-1/2 w-1/2 bg-gray-900 opacity-80 p-6 gap-y-4 items-center rounded-xl">
            <TouchableOpacity onPress={deleteMessageRoom}>
              <Text className="font-bold text-[20px] text-white border-b-[1px] border-yellow-500 ">
                Delete Room
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MessageRoomModal;
