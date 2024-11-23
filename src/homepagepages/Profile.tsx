import {
  View,
  Text,
  Image,
 
  TouchableOpacity,
 
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AboutModal from '../component/AboutModal';
import TelModal from '../component/TelModal';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {ImagePickerResponse} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const [name, setName] = useState<string>('');
  const [about, setAbout] = useState<string>('');
  const [tel, setTel] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [telModalVisible, setTelModalVisible] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string>('');
  const defaultAvatarUrl =
    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  const user = auth().currentUser;

  const email = user?.email;

  const navigation = useNavigation<any>();

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('loginTime');
      await AsyncStorage.removeItem('userToken');
      auth().signOut();
      navigation.replace('LoginPage');
    } catch (error) {}
  };

  const selectImageWithPermission = () => {
    requestPermission();
    selectImage();
  };

  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
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
    const storageRef = storage().ref(`profile_pictures/${filename}`);
    const task = storageRef.putFile(uri);
    task.on('state_changed', snapshot => {});
    try {
      await task;
      const downloadURL = await storageRef.getDownloadURL();

      firestore()
        .collection('users')
        .doc(user?.uid)
        .update({photo: downloadURL});
      setImageUri(downloadURL);
    } catch (error) {}
  };

  const profileInfo = () => {
    try {
      firestore()
        .collection('users')
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            if (doc.data().email === email) {
              const {name, about, tel, photo} = doc.data();

              setName(name);
              setAbout(about);
              setTel(tel);
              setImageUri(photo || defaultAvatarUrl);
            }
          });
        });
    } catch (error) {
      if (error instanceof Error) {
      }
    }
  };
  useEffect(() => {
    profileInfo();
  }, [about, name, tel, imageUri]);

  return (
    <SafeAreaView className="flex-1 ">
      <LinearGradient
        colors={['#123456', '#123444', '#123333', '#123222']}
        className="flex-1">
        <View className=" w-full h-full  gap-y-[50px] mt-10" style={{flex: 1}}>
          <View style={{flex: 1}} className="  justify-center items-center ">
            <View className="flex-1  justify-center items-center">
              {imageUri ? (
                <Image
                  source={{uri: imageUri}}
                  style={{width: 120, height: 120}}
                  resizeMode="cover"
                  className="rounded-full"
                />
              ) : (
                <ActivityIndicator />
              )}

              <TouchableOpacity
                activeOpacity={0.5}
                onPress={selectImageWithPermission}
                className="absolute top-[70px] right-11  rounded-full bg-black w-8 h-8 justify-center items-center">
                <AntDesign name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flex: 1}} className=" gap-y-2 pt-4   ">
            <View className="flex-row gap-x-4 m-2 justify-between ">
              <Text>Name :</Text>
              <Text className="text-white w-[200px]  mr-[108px]">{name}</Text>
            </View>
            <View className="flex-row gap-x-4 m-2 justify-between ">
              <Text>Tel :</Text>
              <Text className="text-white w-[200px]  mr-[102px]">{tel}</Text>
              <TouchableOpacity
                className="absolute right-0"
                activeOpacity={0.5}
                onPress={() => setTelModalVisible(true)}>
                <AntDesign name="edit" size={20} color="white" />
                <TelModal
                  telModalVisible={telModalVisible}
                  setTelModalVisible={setTelModalVisible}
                  tel={tel}
                  setTel={setTel}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-x-4 justify-start items-start m-2">
              <Text>About :</Text>
              <Text className="text-white h-[200px] w-[200px]    ">
                {about}
              </Text>

              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => setModalVisible(true)}
                className="absolute right-0">
                <AntDesign name="edit" size={20} color="white" />
                <AboutModal
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                  about={about}
                  setAbout={setAbout}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className=" w-full h-full    " style={{flex: 2}}>
          <View
            style={{flex: 2}}
            className="flex w-full items-center  justify-end absolute bottom-10">
            <TouchableOpacity
              onPress={logout}
              className=" w-[100px] h-[40px] justify-center  items-center mt-10 rounded-full bg-red-100 ">
              <Text className="text-black  ">Logout</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}></View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Profile;
