import React, { useEffect, useRef, useState } from 'react';

import * as FileSystem from 'expo-file-system';

import { Button, FlatList, Text, TouchableOpacity, View, Image, RefreshControl, Animated, Dimensions, Easing, Keyboard, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Audio, AVPlaybackStatus } from 'expo-av';

import Swipeable from 'react-native-gesture-handler/Swipeable';

import { header } from '../../styles/components/header';
import { theme } from '../../styles/colors/theme';
import { post } from '../../styles/components/post';
import { comments as commentsStyle } from '../../styles/components/comments';

import SoundWave from '../../components/SoundWave';
import Header from '../../components/Header';
import Post from '../../components/Post';

// import * as firebase from 'firebase';
import firebase from 'firebase';
import 'firebase/firestore';
import Comment from '../../components/Comment';
// import { TextInput } from 'react-native-gesture-handler';


const Home = ({ navigation } : any) => {
    useEffect(() => {
        checkIfLoggedIn()
    });

    const [currentUser, setCurrentUser] = useState<firebase.User | null>();
    const [commentInputValue, setCommentInputValue] = useState<string>('');
    const [isFetchingComments, setIsFetchingComments] = useState(false);

    // ! ======================== comment section ============================

    const [comments, setComments] = useState<firebase.firestore.DocumentData[]>([]);
    const [commentSectionPostId, setcommentSectionPostId] = useState<string>();

    // State variables / variables for popup-animation
    const { height, width } = Dimensions.get("window");
    const formHeight = height / 10 * 9;
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [formAnimation, setFormAnimation] = useState({
        positionY: new Animated.Value(isFormOpen ? 0 : formHeight)
    });
    const animatedTransform = {
        transform: [{translateY: formAnimation.positionY}],
    }
    

    const renderComment = (comment: any) => {
        return (
            <Comment comment={comment} userId={comment.userId}></Comment>
        )
    }

    const toggleForm = (hideShow: string | null = null) => {
        if (hideShow != null) {
            if (hideShow == 'hide') {

            } else if (hideShow == 'show') {

            }
        }

        setIsFormOpen((state: boolean) => {
            Animated.timing(formAnimation.positionY, {
                toValue: state ? formHeight : 0,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.quad),
            }).start();
            
            if (hideShow) {
                if (hideShow == 'hide') {
                    setIsFormOpen(false);
                } else if (hideShow == 'show') {
                    setIsFormOpen(true);
                }
            } else {
                setIsFormOpen(state ? false : true);
            }

            return state;
        });
        if (!isFormOpen) setComments([]);
    }

    const saveComment = (comment: string, postId: string) => {
        firebase.firestore().collection('comments').doc().set({
            created_at: Date.now(),
            isCorrect: false,
            post_id: postId,
            text: commentInputValue,
            user_id: currentUser?.uid,
        })
        .then(() => {
            getComments(postId);
        })
        .catch((error) => {
            console.error(error);
        })
    }

    const getComments = (postId: string) => {
        setIsFetchingComments(true);
        firebase.firestore().collection('comments')
        .where('post_id', '==', postId)
        .orderBy('isCorrect', 'desc')
        .orderBy('created_at', 'desc')
        .get()
        .then((snapshot) => {
            let commentsArray: firebase.firestore.DocumentData[] = [];
            snapshot.forEach((doc) => {
                //@ts-ignore
                let comment = doc.data();
                comment['id'] = doc.id;
                commentsArray.push(comment);
            });
            setComments(commentsArray)
        }).catch((error) => {
            console.log("Error getting comments:", error);
        });
        setIsFetchingComments(false);
    }

    const showCommentSection = (postId: string) => {
        setcommentSectionPostId(postId);
        toggleForm('hide');
        getComments(postId);
        toggleForm();
    }

    // ! =======================================================================

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
                // console.log(user.uid);
            } else {
                firebase.auth().signOut()
                navigation.navigate('Login', { error: 'not logged in' });
            }
        })
    }

    
    useEffect(() => {
        getPosts();
    }, [])

    const [data, setData] = useState<firebase.firestore.DocumentData[]>([]);

    const dbf = firebase.firestore();

    const [isFetching, setIsFetching] = useState(false);
    	

    const onRefresh = () => {
        setIsFetching(true);
        getPosts();
    }

    //! ============================================================================================


    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [onTouchStartComments, setOnTouchStartComments] = useState<number | undefined>()
    const [commentsScrollLocation, setCommentsScrollLocation] = useState<number>(0);

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
            console.error(error);
        }
        // @ts-ignore
        const info = await FileSystem.getInfoAsync(recording.getURI());
        console.log(`FILE INFO: ${JSON.stringify(info)}`);
        
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

    //! ============================================================================================

      const getPosts = async () => {
        setIsFetching(true);
        await dbf.collection("posts").orderBy('created_at', 'desc').where('finished', '==', false)
            .get()
            .then((querySnapshot) => {
                let newData: firebase.firestore.DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    //@ts-ignore
                    let test = doc.data();
                    test['id'] = doc.id;
                    newData.push(test);
                });
                // console.log(newData);
                setData(newData);
                setIsFetching(false);
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }


    const renderItem = ({item}: any) => {
        return (
            <Post postData={item} showComments={showCommentSection} ></Post>
        )
    }

    return (

        <SafeAreaView style={{backgroundColor: theme[100], overflow: 'hidden'}}>
            

            <Header showProfilePicture={true} userId={currentUser?.uid}/>
            <FlatList
                // onScroll={(e) => {
                //     console.log(e.nativeEvent.contentOffset.y)
                // }}
                contentContainerStyle={{ paddingBottom: 100, minHeight: '90%' , paddingTop: 8}}
                data={data} 
                renderItem={renderItem}
                keyExtractor={(post): any => post.id.toString()}
                refreshControl={
                    <RefreshControl
                        onRefresh={() => onRefresh()}
                        refreshing={isFetching}
                        title="Pull to refresh"
                        tintColor="#474574"
                        titleColor="#474574"
                    />
                }
            />

            
            {/* ---------- COMMENT SETCION ----------- */}
            <Animated.View
                style={[commentsStyle.commentSection, animatedTransform]}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        toggleForm('hide');
                    }}
                    style={[commentsStyle.closeCommentsButton]}
                >
                    <Svg
                        viewBox="0 0 21.213 21.213"
                        style={{
                            width: '30%',
                            height: '30%',
                        }}
                    >
                        <G
                            data-name="Menu Icon Close"
                            fill="none"
                            stroke="#000"
                            strokeLinecap="round"
                            strokeWidth={3}
                        >
                            <Path data-name="Line 3" d="M19.092 2.122l-16.97 16.97" />
                            <Path data-name="Line 5" d="M2.122 2.122l16.97 16.97" />
                        </G>
                    </Svg>
                </TouchableOpacity>
                
                <FlatList
                    data={comments} 
                    renderItem={renderComment}
                    keyExtractor={(comment): any => comment.id.toString()}
                    style={[commentsStyle.container, ]}
                    onTouchStart={(e) => {
                        console.log('Touch start: ', e.nativeEvent.locationY)
                        setOnTouchStartComments(e.nativeEvent.locationY);
                    }}
                    onTouchEnd={(e) => {
                        console.log('Touch end: ', e.nativeEvent.locationY);
                        console.log('Comments scrolllocation: ', commentsScrollLocation);
                        if (commentsScrollLocation < 20) {
                            if (onTouchStartComments) {
                                if ((e.nativeEvent.locationY - onTouchStartComments) >= 30) {
                                    toggleForm()
                                }
                            }
                        }
                    }}

                    contentContainerStyle={{
                        paddingBottom: 150,
                    }}

                    
                >
                </FlatList>

                <View
                    style={[commentsStyle.commentInputContainer]}
                >   

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '90%',
                        }}
                    >
                        <TextInput
                            placeholder="Write a comment..."
                            onChangeText={(value) => {
                                setCommentInputValue(value)
                            }}
                            value={commentInputValue}
                            multiline={true}
                            maxLength={100}
                            style={[commentsStyle.commentInputField]}
                        >
                        </TextInput>
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                right: 5,
                                aspectRatio: 1,
                                borderRadius: 50,
                                height: '80%',
                                alignSelf: 'center',
                                backgroundColor: theme[100] ,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}

                            onPress={() => {
                                if (commentInputValue && commentInputValue != '') {
                                    saveComment(commentInputValue, commentSectionPostId ? commentSectionPostId : '');
                                    setCommentInputValue('')
                                } else {
                                    console.log('Please fill in a comment!')
                                }
                            }}
                        >
                            <Svg style={{width: '50%', height: '50%'}} viewBox="0 0 512 441.779">
                                <Path
                                    fill="black"
                                    data-name="Path 20"
                                    d="M481.508 175.224L68.414 3.815A49.442 49.442 0 001.557 61.697l40.594 159.192L1.557 380.081a49.441 49.441 0 0066.857 57.882l413.094-171.409a49.44 49.44 0 000-91.33zm-11.5 63.62L56.916 410.253a19.441 19.441 0 01-26.288-22.764l38.659-151.6h417.722c8.285 0 15.788-6.715 15.788-15s-7.5-15-15.788-15H69.288l-38.66-151.6a19.44 19.44 0 0126.287-22.76l413.094 171.405a19.439 19.439 0 010 35.91z"
                                />
                            </Svg>
                        </TouchableOpacity>
                    </View>

                </View>
            </Animated.View>
        </SafeAreaView>

    )
}

export default Home;