import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
  Keyboard,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import storage from '@react-native-firebase/storage';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import Video from 'react-native-video';

import {ImagePickerResponse} from 'react-native-image-picker';
import * as Progress from 'react-native-progress';


interface FileType {
  file: string;
  createdAt: any;
}

interface Props {
  navigation: any;
  route: any;
}
interface FounderMessage {
  founderMessage: string;
  founderCreatedAt: any;
  sender: any;
  files: FileType[];
}
interface NotFounderMessage {
  notFounderMessage: string;
  notFounderCreatedAt: any;
}
const Messages: React.FC<Props> = ({navigation, route}) => {
  const [notFounderMessages, setNotFounderMessages] = useState<
    NotFounderMessage[]
  >([]);
  const [filePhoto, setFilePhoto] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [founderMessages, setFounderMessages] = useState<FounderMessage[]>([]);
  const [rooms, setRooms] = useState<Array<any>>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [imageUri, setImageUri] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0); 

  const [isBackPressed, setIsBackPressed] = useState(false);

  const {notFounderEmail, founderEmail, roomId, noFounderPhoto, name} =
    route.params;

  const user = auth().currentUser;
  const flatListRef = useRef<FlatList>(null);
  const deleteAllMessages=() => {
    firestore().collection(`chatrooms`).doc(roomId).update({
    
      founderMessages: [],
    })
  }

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsFocused(true);
        flatListRef.current?.scrollToEnd({animated: true});
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsFocused(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (user?.uid && roomId) {
      // Firestore'dan mesajları dinleme
      const unsubscribe = firestore()
        .collection('chatrooms')
        .doc(roomId)
        .onSnapshot(documentSnapshot => {
          const data = documentSnapshot.data();

          if (data && data.founderMessages) {
            const updatedFounderMessages = data.founderMessages.map(
              (msg: any) => ({
                file: msg.file || '',
                fileType: msg.fileType || '',
                isLoading: msg.isLoading,
                sender: msg.sender,
                founderMessage: msg.founderMessage,
                founderCreatedAt: msg.founderCreatedAt
                  ? msg.founderCreatedAt.toDate().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'No date available',
              }),
            );
            setFounderMessages(updatedFounderMessages);

            setMessage('');
            flatListRef.current?.scrollToEnd({animated: true});
          }
          // getPhoto();
        });

      return () => unsubscribe();
    }
  }, [roomId, user?.uid]);

  const sendMessage = () => {
    if (message.trim()) {
      // Mesajın boş olmadığından emin olun

      firestore()
        .collection('chatrooms')
        .doc(roomId)
        .update({
          founderMessages: firestore.FieldValue.arrayUnion({
            sender: user?.email,
            founderMessage: message || '',
            founderCreatedAt: firestore.Timestamp.now(),
            file: filePhoto || '',
          }),
        })
        .then(() => {
          setMessage(''); // Mesaj gönderildiğinde girişi temizle
          flatListRef.current?.scrollToEnd({animated: true});
        })
        .catch(error => {
          console.error('Error sending message: ', error);
        });
    }
  };

  const selectImageWithPermission = () => {
    requestPermission();
    selectImage();
  };

  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'mixed',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };
    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
      } else if (response.errorCode) {
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          uploadImageToStorage(uri);
        } else {
        }
      }
    });
  };
  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'External Storage Permission',
          message: 'This app needs access to your storage to upload photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const uploadImageToStorage = async (uri: string) => {
    if (!uri) return;

    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const fileExtension = filename.split('.').pop();
    const storageRef = storage().ref(`message_files/${filename}`);
    const task = storageRef.putFile(uri);
    const tempMessage = {
      sender: user?.email,
      founderMessage: message || '',
      founderCreatedAt: firestore.Timestamp.now(),
      file: uri, // Yükleme işlemi sırasında geçici olarak dosya yolunu kullan
      fileType: fileExtension,
      isLoading: true, // Yükleniyor durumunda
    };
    await firestore()
      .collection('chatrooms')
      .doc(roomId)
      .update({
        founderMessages: firestore.FieldValue.arrayUnion(tempMessage),
      });
    task.on('state_changed', snapshot => {
      setUploading(true);
      
      const percentTransferred = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
      );
      setTransferred(percentTransferred);
    });
    try {
      await task;
      const downloadURL = await storageRef.getDownloadURL();

      const updatedMessage = {
        ...tempMessage,
        file: downloadURL,
        isLoading: false, // Yükleme tamamlandı
      };

      await firestore()
        .collection('chatrooms')
        .doc(roomId)
        .update({
          founderMessages: firestore.FieldValue.arrayRemove(tempMessage),
        });
      await firestore()
        .collection('chatrooms')
        .doc(roomId)
        .update({
          founderMessages: firestore.FieldValue.arrayUnion(updatedMessage),
        });

      setFilePhoto(downloadURL);
      setUploading(false);
    } catch (error) {
    } finally {
    }
  };
  //   
  // 
  

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#123456', '#123444', '#123333', '#123222']}
        className="flex-1  ">
        <View
          style={{flex: 1}}
          className="border-2 justify-between items-center flex flex-row">
          <Image
            source={{
              uri:
                noFounderPhoto ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            }}
            resizeMode="cover"
            className="w-[70px] h-[70px] rounded-full ml-5"
          />
          <Text className="text-white text-2xl mr-[130px] mb-5">{name}</Text>

          <TouchableOpacity onPress={deleteAllMessages}>

          <AntDesign
            name="delete"
            size={30}
            color="white"
            style={{marginRight: 10}}
          />
          </TouchableOpacity>
        </View>
        <View style={{flex: 8}} className="border-2 w-full  ">
          <FlatList
            ref={flatListRef}
            className={`w-fullasd h-screen`}
            data={founderMessages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item, index}) => (
              <View
                className={`m-1 mr-2 flex rounded-lg p-2 w-full h-auto ${
                  item.sender === user?.email ? 'items-end' : 'items-start'
                }`}>
                <View className="rounded-3xl p-3 h-auto w-[230px] bg-gray-800">
                  <Text className="text-gray-400 text-[12px]">
                    {item.founderCreatedAt}
                  </Text>
                  <Text className="text-white text-[15px]">
                    {item.founderMessage}
                  </Text>
                  {item.file && item.fileType === 'jpg' && (
                    <Image
                      source={{uri: item.file}}
                      className="w-40 h-40 mt-4"
                    />
                  )}

                  {item.isLoading ? (
                    <View className=" w-4 h-4 mb-2">
                      <Text className=" ">{transferred}% Completed</Text>
                      <Progress.Bar
                        color="white"
                        progress={transferred / 100}
                        width={200}
                      />
                    </View>
                  ) : (
                    item.fileType === 'mp4' && (
                      <Video
                        className="w-[200px] h-[120px]"
                        source={{uri: item.file}}
                        resizeMode="contain"
                        controls={true}
                        paused={true}
                        onError={() => {
                          console.error('Video loading error');
                        }}
                      />
                    )
                  )}
                </View>
              </View>
            )}
          />

          <View
            className={`flex flex-row w-full justify-start items-center space-x-1  ${
              isFocused ? 'mb-64' : 'mb-4'
            } `}>
            <TextInput
              maxLength={300}
              multiline
              placeholder="Enter your message"
              className={`border-2 rounded-2xl w-[280px] mr-2 pl-4 ${
                isFocused ? 'border-gray-600 ' : 'border-gray-200'
              }`}
              value={message}
              onChangeText={setMessage}
              onFocus={() => {
                setIsFocused(true);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
            />
            <TouchableOpacity
              onPress={selectImageWithPermission}
              className="border-2 rounded-2xl p-1 mr-2 ">
              <MaterialIcons name="attach-file" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={sendMessage}>
              <FontAwesome name="send" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Messages;
