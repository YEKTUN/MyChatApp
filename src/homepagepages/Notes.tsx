import {Text, View, TouchableOpacity, FlatList,Animated} from 'react-native';
import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import NoteModal from '../component/NoteModal';
import firestore from '@react-native-firebase/firestore';
import Entypo from 'react-native-vector-icons/Entypo';

import EditNoteModal from '../component/EditNoteModal';
import { set } from '@react-native-firebase/database';

interface NoteList {
  message: string;
  createdAt: Date;
  userId: string;
  subject: string;
  id: string;
}
const noteOptions = ['Delete', 'Starred'];
const user = auth().currentUser;
const Notes = () => {
  const [noteModal, setNoteModal] = useState<boolean>(false);
  const [noteList, setNoteList] = useState<NoteList[]>([]);
  const [editNoteModal, setEditNoteModal] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<NoteList | null>(null);
  const [currentUser, setCurrentUser] = useState(auth().currentUser);
  const [noteOptionModal, setNoteOptionModal] = useState<boolean>(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [opacityAnim] = useState(new Animated.Value(0)); 
  const getNotes = async (userId: string) => {
    try {
      const querySnapshot = await firestore()
        .collection('notes')
        .where('userId', '==', userId)
        .get();

      const notes: NoteList[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          message: data.message || '',
          // createdAt: data.createdAt?.toDate().toLocaleTimeString([], {
          //   year: 'numeric',
          //   month: '2-digit',
          //   day: '2-digit',
          //   hour: '2-digit',
          //   minute: '2-digit',
          // }) || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          userId: data.userId || '',
          subject: data.subject || '',
          id: doc.id,
        };
      });
      const sortedNotes = notes.sort(
        (a: any, b: any) => b.createdAt - a.createdAt,
      );
      setNoteList(sortedNotes);
    } catch (error) {
      console.error('Error fetching notes: ', error);
    }
  };
  const deleteNote=(item:string) => {
           firestore().collection('notes').doc(item).delete().then(() => {
            setNoteOptionModal(false);
            
           })   
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        getNotes(user.uid);
      } else {
        setNoteList([]);
      }
    });

    return subscriber; // Auth state change subscriber
  }, []);

  useEffect(() => {
    if (currentUser) {
      getNotes(currentUser.uid);
    }
  }, [currentUser, noteModal, editNoteModal, noteOptionModal]);
  

  useEffect(() => {
    if(noteOptionModal==true){

      Animated.timing(opacityAnim, {
        toValue: 13,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }else{

      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

  }, [noteOptionModal, selectedNote]);
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#123456', '#123444', '#123333', '#123222']}
        className="flex-1 flex-col justify-center items-center">
        <TouchableOpacity
          onPress={() => setNoteModal(true)}
          className="  w-[50px] h-[50px]  bg-violet-400 rounded-2xl flex border-2  justify-center items-center">
          <Text className="text-[20px] font-bold text-black">+</Text>
        </TouchableOpacity>
        <FlatList
          data={noteList}
          keyExtractor={item => item.id}
          numColumns={2}
          className="flex-1 mt-1"
          renderItem={({item}) => (
            <View className=" p-2">
              <TouchableOpacity
                onPress={() => {
                  setEditNoteModal(true);
                  setSelectedNote(item);
                  setNoteOptionModal(false);
                }}
                className="w-[150px] h-[150px] bg-slate-300 rounded-2xl justify-start items-start m-4 p-2">
                <Text className="text-[30px] font-bold text-black">
                  {item.subject.length > 10
                    ? `${item.subject.slice(0, 10)}...`
                    : item.subject}
                </Text>
                <Text className="text-[10px] text-gray-700">
                  {item.message.length > 50
                    ? `${item.message.slice(0, 50)}...`
                    : item.message}
                </Text>
                <Text className="text-[10px]  text-slate-700 font-semibold absolute bottom-2 left-3 ">
                  {item.createdAt.toLocaleTimeString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (selectedNoteId === item.id) {
                      setNoteOptionModal(!noteOptionModal); // Eğer mevcutsa, mevcut menüyü kapat
                      setSelectedNoteId(null); // Seçili id'yi sıfırla
                    } else {
                      setSelectedNoteId(item.id); // Yeni seçili notun id'sini güncelle
                      setNoteOptionModal(true); // Yeni menüyü aç
                    }
                  }}
                  className="absolute bottom-0 right-0   p-2 ">
                  <Entypo
                    style={{color: 'black'}}
                    name="dots-three-vertical"
                    size={15}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              {selectedNoteId === item.id&&  (
                <Animated.View
                style={{
                  opacity: opacityAnim,
                  position: 'absolute',
                  right: 13,
                  top:60,
                  width: 50,
                  height: 90,
                  backgroundColor: 'rgba(100, 100, 100, 0.8)',
                  borderRadius: 8,
                 paddingTop:5,
                  alignItems: 'center',
                }}>
                  {noteOptions.map((option, index) => (
                    <TouchableOpacity onPress={() => {
                      if (option === 'Delete') {
                        deleteNote(item.id);
                      }
                    }}  key={index}>
                      <Text  className="text-[10px] font-semibold mt-[5px] text-white border-b-[1px]">{option}</Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </View>
          )}
        />

        {selectedNote && (
          <EditNoteModal
            editNoteModal={editNoteModal}
            setEditNoteModal={setEditNoteModal}
            selectedNote={selectedNote}
            noteList={noteList} // Seçilen notu modal'a gönder
          />
        )}
        <NoteModal
          noteList={noteList}
          noteModal={noteModal}
          setNoteModal={setNoteModal}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Notes;
