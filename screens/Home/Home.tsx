import React, { useEffect, useState } from 'react';

import * as FileSystem from 'expo-file-system';

import { Button, FlatList, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Audio, AVPlaybackStatus } from 'expo-av';

import { header } from '../../styles/components/header';
import { theme } from '../../styles/colors/theme';
import { post } from '../../styles/components/post';

import SoundWave from '../../components/SoundWave';
import Header from '../../components/Header';
import Post from '../../components/Post';

// import * as firebase from 'firebase';
import firebase from 'firebase';
import 'firebase/firestore';


const Home = ({ navigation } : any) => {
    useEffect(() => {
        checkIfLoggedIn()
    });

    const [currentUser, setCurrentUser] = useState<firebase.User | null>();

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
                console.log(user.uid);
            } else {
                navigation.navigate('Login', { error: 'not logged in' });
                // firebase.auth().signOut()
            }
        })
    }

    
    useEffect(() => {
        getPosts();
    }, [])

    const [data, setData] = useState<firebase.firestore.DocumentData[]>([]);

    const dbf = firebase.firestore();
    	


    //! ============================================================================================


    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    async function startRecording() {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            }); 
  
            // Start recording
            console.log('Starting recording..');
            const _recording = new Audio.Recording();
            _recording.setOnRecordingStatusUpdate((rec) => {console.log(rec)})
            await _recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        
            setRecording(_recording);
            await _recording.startAsync();
  
            console.log('Recording started');
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }
    
    async function stopRecording() {
        try {
            // @ts-ignore
            await recording.stopAndUnloadAsync();
        } catch (error) {
        // Do nothing -- we are already unloaded.
        }
        // @ts-ignore
        console.log(recording);
        // @ts-ignore
        const info = await FileSystem.getInfoAsync(recording.getURI());
        console.log(`FILE INFO: ${JSON.stringify(info)}`);
        
  
        // const { sound: _sound, status } = await recording.createNewLoadedSoundAsync(
        //     {
        //       isLooping: false,
        //       isMuted: false,
        //       volume: 1.0,
        //       rate: 1.0,
        //       shouldCorrectPitch: true,
        //     }
        // );

        // setSound(_sound);
        setIsRecording(false);
    }


    const uploadRecording = async () => {
        let soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync(require('../../assets/sound2.wav'));
            soundObject.playAsync();
        } catch (e) {
            console.log('ERROR Loading Audio', e);
        }
    }


    //! ============================================================================================



    const getPosts = async () => {
        await dbf.collection("posts").orderBy('created_at', 'desc')
            .get()
            .then((querySnapshot) => {
                let newData: firebase.firestore.DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    //@ts-ignore
                    let test = doc.data();
                    test['id'] = doc.id;
                    newData.push(test);
                });
                console.log(newData);
                setData(newData);
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }

    const saveRecording = async (description: string) => {

        const uri: string | null | undefined = recording?.getURI();

        if (uri) {
            let response = await fetch(uri);
            let blob = await response.blob();


            const firestoreRef = firebase.firestore().collection('posts').doc();

            firebase.storage().ref().child(`recordings/${currentUser?.uid}/${firestoreRef.id}.m4a`)
            .put(blob).then((snapshot) => {
                
                snapshot.ref.getDownloadURL().then((url) => {
                    // Write to Firestore
                    firestoreRef.set({
                        created_at: Date.now(),
                        description: description,
                        recording: url,
                        recordingDuration: recording?._finalDurationMillis,
                        userId: currentUser?.uid,
                    });
                });
            });
            console.log('Uploaded successfully: 🎉🎉🎉');

        }
    }

    const renderItem = ({item}: any) => {
        return (
            <Post postData={item} ></Post>
        )
    }

    return (

        <SafeAreaView style={{backgroundColor: theme[600], overflow: 'hidden'}}>
            

            <Header/>

            {/* <TouchableOpacity
                onPressIn={() => {
                    startRecording();
                }}
                onPressOut={() => {
                    stopRecording();
                }}
                style={{
                    padding: 20,
                }}                
            >
                <Text>Record</Text>
            </TouchableOpacity>
                
            <TouchableOpacity
                style={{
                    padding: 20,
                }}
                onPress={() => {
                    if (recording) {
                        saveRecording('Dit is een description 😁');
                    }
                }}     
            >
                <Text>Save to firebase</Text>    
            </TouchableOpacity>  */}

            <FlatList
                contentContainerStyle={{ paddingBottom: 100, minHeight: '90%' }}
                data={data} 
                renderItem={renderItem}
                keyExtractor={(post): any => post.id.toString()} 
            />
        </SafeAreaView>

    )
}

export default Home;