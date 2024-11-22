import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
   
  } from 'react-native';
  import React, {FC, useState, useEffect} from 'react';
  import Entypo from 'react-native-vector-icons/Entypo';
  import LinearGradient from 'react-native-linear-gradient';
  import Feather from 'react-native-vector-icons/Feather';
  import firestore from '@react-native-firebase/firestore'

  import {Alert} from 'react-native';
  interface NoteList {
    message: string;
    createdAt: Date;
    userId: string;
    subject: string;
    id: string;
  }
  interface Props {
    editNoteModal: boolean;
    setEditNoteModal: React.Dispatch<React.SetStateAction<boolean>>;
    noteList: NoteList[];
    selectedNote: NoteList | null;
  }
  const EditNoteModal: FC<Props> = ({editNoteModal, setEditNoteModal,noteList,selectedNote}) => {
    const [noteSubject, setNoteSubject] = useState<string>('');
    const [noteMessage, setNoteMessage] = useState<string>('');
  
    const handleNoteSubjectUpper = (text: string) => {
      setNoteSubject(text.toUpperCase());
    };
  
    // Note Message'ın ilk harfini büyük yap
    const handleNoteMessageFirstUpper = (text: string) => {
      setNoteMessage(text.charAt(0).toUpperCase() + text.slice(1));
    };
    
  
    const updateNote = async () => {
        if (!noteSubject || !noteMessage) {
          Alert.alert('Please fill in all fields');
          return;
        }
    
        try {
          await firestore().collection('notes').doc(selectedNote?.id).update({
            subject: noteSubject,
            message: noteMessage,
            updatedAt: firestore.FieldValue.serverTimestamp(), // Güncelleme zamanı ekleniyor
          });
          setEditNoteModal(false);
          setNoteMessage('');
          setNoteSubject('');
        } catch (error) {
          console.error('Error updating note: ', error);
          setEditNoteModal(false);
        }
      };
      const getIdNotes=() => {
        firestore().collection('notes').doc(selectedNote?.id).get().then((doc) => {
          if (doc.exists) {
            setNoteSubject(doc.data()?.subject || '');
            setNoteMessage(doc.data()?.message || '');
          }
        })
      }
      useEffect(() => {
        if (selectedNote) {
            getIdNotes();
          }
      }, [selectedNote, editNoteModal])
    return (
      <Modal
        style={{backgroundColor: 'red'}}
        className="flex-1"
        visible={editNoteModal}
        animationType="slide"
        onRequestClose={() => setEditNoteModal(false)}
        transparent>
        <LinearGradient
          className="flex-1 mt-20 mb-12 rounded-t-3xl shadow-2xl"
          colors={['#B2DABB', '#B2DABB', '#9EDECD', '#123222']}>
          <TouchableOpacity
            className="absolute top-0 right-4 "
            activeOpacity={0.5}
            onPress={() => setEditNoteModal(false)}>
            <Entypo
              name="squared-cross"
              size={30}
              style={{color: 'white', marginTop: 20}}
            />
        
          </TouchableOpacity>
          <TouchableOpacity
            className="absolute top-0 left-4  "
            activeOpacity={0.5}
            onPress={updateNote}>
            <Feather
              name="save"
              size={30}
              color="#4E471D"
              style={{marginTop: 20}}
            />
            <Text className='text-[10px] font-bold text-black ml-[3px]'>Save</Text>
        
          </TouchableOpacity>
          <View className=" flex flex-row  items-center mt-20  border-2 rounded-full mb-2">
            <Text className="m-2 text-black font-bold">Note Subject:</Text>
            <TextInput
              className="border-1 text-black borer-slate-100 rounded-t-md w-[200px] h-[40px] m-2"
              maxLength={20}
              value={noteSubject}
              onChangeText={handleNoteSubjectUpper}
              placeholder="Note Subject"
            />
          </View>
          <View className=" flex flex-row border-2 items-start rounded-2xl">
            <Text className="m-2 mt-3 text-slate-500 font-bold">Note: </Text>
            <TextInput
              className="  h-[500px] w-[320px] text-black "
              textAlignVertical="top"
              maxLength={1000}
              multiline
              value={noteMessage}
              onChangeText={handleNoteMessageFirstUpper}
              placeholder='Add a note...'
            />
          </View>
        </LinearGradient>
      </Modal>
    );
  };
  
  export default EditNoteModal;
  