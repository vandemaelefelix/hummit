import React, { useEffect, useRef, useState } from 'react';

import { Dimensions, Text, TouchableOpacity, View, Image, FlatList, RefreshControl, Animated, ScrollResponderEvent, NativeSyntheticEvent, NativeScrollEvent, Easing, Keyboard, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { theme } from '../../styles/colors/theme';

import firebase from 'firebase';
import 'firebase/firestore';
import Header from '../../components/Header';
import { profile } from '../../styles/components/profile';
import Post from '../../components/Post';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { header } from '../../styles/components/header';

import { comments as commentsStyle } from '../../styles/components/comments';
import Comment from '../../components/Comment';
import CommentSection from '../../components/CommentSection';

// !-----------------------
import { BlurView } from 'expo-blur';


const { height, width } = Dimensions.get("window");

// const HEADER_EXPANDED_HEIGHT = 400;
const HEADER_EXPANDED_HEIGHT = height / 10 * 4;
const HEADER_COLLAPSED_HEIGHT = 60

import * as ImagePicker from 'expo-image-picker';
import { openPicker } from 'react-native-image-crop-picker';

const Profile = ({ navigation } : any) => {
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();
    const [profileData, setProfileData] = useState<firebase.firestore.DocumentData | undefined>();
    const [score, setScore] = useState<number>(0);
    const [data, setData] = useState<firebase.firestore.DocumentData[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);

    
    useEffect(() => {
        checkIfLoggedIn();
        // getPosts();
    }, []);

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if (user) {
                console.log(user.uid)
                setCurrentUser(user);
                getProfileData(user.uid);
                getPosts(user.uid);
            } else {
                firebase.auth().signOut()
                navigation.navigate('Login', { error: 'not logged in' });
            }
        })
    }


    // ! ========== Filling Posts Flatlist ==========
    const renderPost = ({item}: any) => {
        return (
            <Post postData={item} showComments={showCommentSection} ></Post>
        )
    }
    const renderEmptyPost = () => {
        return (
            <View
                style={{
                    width: '100%',
                    paddingVertical: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text>Please post something 🙁</Text>
            </View>
        )
    }
    
    const getProfileData = async (user_id: string) => {
        await firebase.firestore()
            .collection('users')
            .doc(user_id).get()
            .then((doc: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => {
                setProfileData(doc.data());
            }).catch((error) => {
                console.error("Error getting profile data:", error);
            });

        await firebase.firestore()
            .collection('comments')
            .where('user_id', '==', user_id).get()
            .then((snapshot) => {
                let scoreCount = 0;
                snapshot.forEach((doc) => {
                    if (doc.data().isCorrect) {
                        scoreCount += 5;
                    }
                })
                setScore(scoreCount);
            });
    }

    const getPosts = async (userId: string) => {
        if (!isFetching) setIsFetching(true);
        await firebase.firestore().collection("posts").orderBy('created_at', 'desc').where('userId', '==', userId)
            .get()
            .then((querySnapshot) => {
                let newData: firebase.firestore.DocumentData[] = [];
                querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>) => {
                    let data = doc.data();
                    data['id'] = doc.id;
                    newData.push(data);
                });
                setData(newData);
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
        console.log('Done fetching comments');
        setIsFetching(false);
    }

    // ! ========== Comment Section ==========
    const childRef = useRef();

    const showCommentSection = (postId: string) => {
        childRef.current?.openCommentSection(postId);
    }


    // ! ========== Image Picker With Crop Function ==========

    const [image, setImage] = useState<string | null>(null);
    const [displayImagePopUp, setDisplayImagePopUp] = useState(false);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
            }
        })();
    }, []);
    
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.1,
        });

        console.log(result);

        if (!result.cancelled) {
            // setImage(result.uri);
            saveImage(result.uri);
            getProfileData(currentUser?.uid ? currentUser?.uid : '');
        }
    };

    const takeImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.1,
        });

        console.log(result);

        if (!result.cancelled) {
            saveImage(result.uri);
            setIsRefresh(true);
            await getProfileData(currentUser?.uid ? currentUser?.uid : '');
            await setTimeout(() => {
                setIsRefresh(false);
            }, 1000)
        }
    }

    const saveImage = async (uri: string) => {
        if (uri) {
            let response = await fetch(uri);
            let blob = await response.blob();


            const firestoreRef = firebase.firestore().collection('users').doc(currentUser?.uid);

            firebase.storage().ref().child(`profile_pictures/${currentUser?.uid}/${firestoreRef.id}.jpg`)
            .put(blob).then((snapshot) => {
                
                snapshot.ref.getDownloadURL().then((url) => {
                    firestoreRef.update({
                        profile_picture: url
                    });
                });
            });
            console.log('Uploaded successfully: 🎉🎉🎉');

        }
    }

    const [isImagePickerPopUpOpen, setIsImagePickerPopUpOpen] = useState(false)
    const [imagePickerPopUpAnimationScale, setImagePickerPopUpAnimationScale] = useState(new Animated.Value(0.6));
    const [imagePickerPopUpAnimationOpacity, setImagePickerPopUpAnimationOpacity] = useState(new Animated.Value(0));
    const imagePickerPopUpAnimatedValues = {
        transform: [{scale: imagePickerPopUpAnimationScale }],
        opacity: imagePickerPopUpAnimationOpacity,
    }
    const imagePickerBackgroundAnimatedValue = {
        opacity: imagePickerPopUpAnimationOpacity,
    }


    const toggleImagePickerPopUp = () => {
        
        Animated.timing(imagePickerPopUpAnimationScale, {
            toValue: isImagePickerPopUpOpen ? 0.6 : 1,
            duration: 250,
            useNativeDriver: true,
            easing: isImagePickerPopUpOpen ? Easing.out(Easing.elastic(1)) : Easing.in(Easing.elastic(1)),
        }).start();
        Animated.timing(imagePickerPopUpAnimationOpacity, {
            toValue: isImagePickerPopUpOpen ? 0 : 1,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start(() => {
            if(isImagePickerPopUpOpen) setIsImagePickerPopUpOpen(false);
        });
        if (!isImagePickerPopUpOpen) setIsImagePickerPopUpOpen(true);
    }

    // TODO: ========== Options menu ==========

    const [isOptionMenuPopUpOpen, setIsOptionMenuPopUpOpen] = useState(false)
    const [optionMenuPopUpAnimationScale, setOptionMenuPopUpAnimationScale] = useState(new Animated.Value(0.6));
    const [optionMenuPopUpAnimationOpacity, setOptionMenuPopUpAnimationOpacity] = useState(new Animated.Value(0));
    const optionMenuPopUpAnimatedValues = {
        transform: [{scale: optionMenuPopUpAnimationScale }],
        opacity: optionMenuPopUpAnimationOpacity,
    }
    const optionMenuBackgroundAnimatedValue = {
        opacity: optionMenuPopUpAnimationOpacity,
    }


    const toggleOptionMenuPopUp = () => {
        
        Animated.timing(optionMenuPopUpAnimationScale, {
            toValue: isOptionMenuPopUpOpen ? 0.6 : 1,
            duration: 250,
            useNativeDriver: true,
            easing: isOptionMenuPopUpOpen ? Easing.out(Easing.ease) : Easing.in(Easing.elastic(1)),
        }).start();
        Animated.timing(optionMenuPopUpAnimationOpacity, {
            toValue: isOptionMenuPopUpOpen ? 0 : 1,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start(() => {
            if(isOptionMenuPopUpOpen) setIsOptionMenuPopUpOpen(false);
        });
        if (!isOptionMenuPopUpOpen) setIsOptionMenuPopUpOpen(true);
    }


    // TODO: ==================================


    // ! ========== Scroll Animation ==========
    const [scrollY, setScrollY] = useState<Animated.Value>(new Animated.Value(0));

    const headerHeight: Animated.AnimatedInterpolation = scrollY.interpolate({
        inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
        outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
        extrapolate: 'clamp',
    });
    const headerContentTranslate: Animated.AnimatedInterpolation = scrollY.interpolate({
        inputRange: [0, (HEADER_EXPANDED_HEIGHT-HEADER_COLLAPSED_HEIGHT)],
        outputRange: [0, -200],
        extrapolate: 'clamp'
    });
    const headerBackgroundTranslate: Animated.AnimatedInterpolation = scrollY.interpolate({
        inputRange: [0, (HEADER_EXPANDED_HEIGHT)],
        outputRange: [0, -100],
        extrapolate: 'clamp'
    });
    const headerContentOpacity: Animated.AnimatedInterpolation = scrollY.interpolate({
        inputRange: [0, HEADER_EXPANDED_HEIGHT-HEADER_COLLAPSED_HEIGHT],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });
    const smallHeaderOpacity: Animated.AnimatedInterpolation = scrollY.interpolate({
        inputRange: [HEADER_EXPANDED_HEIGHT / 1.5, HEADER_EXPANDED_HEIGHT],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    }); 
    // ! ======================================

    return (
        <SafeAreaView  style={{backgroundColor: theme[100]}}>

            <CommentSection isProfilePage={true} ref={childRef}></CommentSection>

            <Animated.View
                style={[
                    profile.header,
                    {
                        height: headerHeight,
                        opacity: headerContentOpacity,
                        transform: [{translateY: headerBackgroundTranslate}],
                    }
                ]}
            >
                
                <Animated.View
                    style={[
                        profile.headerContent,
                        {
                            
                            transform: [{translateY: headerContentTranslate}],
                            opacity: headerContentOpacity
                        }
                    ]}
                >

                    <View style={[profile.profilePictureContainer]}>
                        <Image
                            key={profileData ? profileData.profile_picture : 1}
                            // source={profileData ? (profileData.profile_picture ? {uri: profileData.profile_picture} : require('../../assets/profile_empty.png')) : require('../../assets/profile_empty.png')}
                            // source={!isRefresh ? (profileData ? (profileData.profile_picture ? {uri: profileData.profile_picture} : require('../../assets/profile_empty.png')) : require('../../assets/profile_empty.png')) : require('../../assets/profile_empty.png')}
                            source={!isRefresh ? (profileData ? (profileData.profile_picture ? {uri: profileData.profile_picture} : require('../../assets/profile_empty.png')) : require('../../assets/profile_empty.png')) : require('../../assets/profile_empty.png')}
                            style={[profile.profilePicture]}
                        >
                        </Image>
                        <TouchableOpacity 
                            style={[profile.editProfilePicture]}
                            onPress={() => {
                                toggleImagePickerPopUp()
                            }}
                        >
                            <Svg
                                viewBox="0 0 50 50"
                                style={{
                                    width: '50%',
                                    aspectRatio: 1,
                                }}
                            >
                                <Path
                                    data-name="Edit Icon"
                                    d="M48.645 9.022l-7.667-7.667a4.619 4.619 0 00-6.537 0L4.348 31.449a1.648 1.648 0 00-.436.773L.049 47.956a1.651 1.651 0 002 2l15.734-3.864a1.648 1.648 0 00.773-.436l30.089-30.098a4.619 4.619 0 000-6.536z"
                                    fill="#fff"
                                />
                            </Svg>

                        </TouchableOpacity>
                    </View>
                    <View style={[profile.name]}>
                        <Text style={[profile.nameText]}>{profileData ? `${profileData.first_name}` : 'Anonymous'}</Text>
                        <Text style={[profile.nameText]}>{profileData ? `${profileData.last_name}` : ''}</Text>
                    </View>

                    <View style={[profile.info]}>
                        <View style={[profile.friends]}>
                            <Text style={[profile.infoNumber]}>{profileData ? profileData.friends.length : 0}</Text>
                            <Text style={[profile.infoText]}>Friends</Text>
                        </View>
                        <View style={[profile.points]}>
                            <Text style={[profile.infoNumber]}>{score}</Text>
                            <Text style={[profile.infoText]}>Points</Text>
                        </View>
                    </View>

                </Animated.View>

                <Image
                    source={require('../../assets/background.png')}
                    style={[profile.headerBackground]}
                    resizeMethod='scale'
                >
                </Image>
            </Animated.View>

            <Animated.View
                style={[
                    header.container, {
                        justifyContent: 'center',
                        opacity: smallHeaderOpacity,
                    },
                ]}
            >
                <Text style={[header.logo]}>{profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Anonymous'}</Text>
            </Animated.View>

            {/* ---------- Options Button ---------- */}
            <TouchableOpacity
                style={{
                    width: width / 15,
                    aspectRatio: 1,
                    // backgroundColor: 'red',
                    position: 'absolute',
                    top: width / 10,
                    right: (width / 10) / 2,
                    zIndex: 100,
                    transform: [{rotate: '90deg'}],
                }}

                onPress={() => {
                    // navigation.navigate('Register')
                    toggleOptionMenuPopUp()
                }}
            >
                <Svg viewBox="0 0 8 34">
                    <G stroke="#000">
                        <G data-name="Ellipse 12" transform="rotate(90 4 4)">
                            <Circle cx={4} cy={4} r={2.5} fill="#000"/>
                        </G>
                        <G data-name="Ellipse 13" transform="rotate(90 -2.5 10.5)">
                            <Circle cx={4} cy={4} r={2.5} fill="#000"/>
                        </G>
                        <G data-name="Ellipse 14" transform="rotate(90 -9 17)">
                            <Circle cx={4} cy={4} r={2.5} fill="#000"/>
                        </G>
                    </G>
                </Svg>
            </TouchableOpacity>

            {/* Options Popup */}
            {
                isOptionMenuPopUpOpen ? 
                    <Animated.View
                        style={[{
                            position: 'absolute',
                            width: 200,
                            // height: 100,
                            backgroundColor: theme[100],
                            // left: width / 2 - 100,
                            // top: height / 3,
                            right: (width / 10) / 2,
                            top: width / 10 + width / 15,
                            zIndex: 500,
                            borderRadius: 20,
                            elevation: 5,
                        }, optionMenuPopUpAnimatedValues]}
                    >
                        <TouchableOpacity
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 16,
                            }}
                            onPress={() => {
                                firebase.auth().signOut();
                                navigation.navigate('Login');
                                toggleOptionMenuPopUp();
                            }}
                        >
                            <Text>Log out</Text>
                        </TouchableOpacity>
                    </Animated.View>

                :

                <></>
            }    

            <FlatList
                contentContainerStyle={{ paddingBottom: 0, minHeight: height - HEADER_COLLAPSED_HEIGHT, paddingTop: HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT - 16}}
                data={data} 
                renderItem={renderPost}
                keyExtractor={(post): any => post.id.toString()}
                refreshControl={
                    <RefreshControl
                        onRefresh={() => currentUser.uid ? getPosts(currentUser?.uid ) : console.log('No user logged in')}
                        refreshing={isFetching}
                        title="Pull to refresh"
                        tintColor="#474574"
                        titleColor="#474574"
                    />
                }
                ListEmptyComponent={renderEmptyPost}

                scrollEventThrottle={16}

                onScroll={
                    Animated.event([
                        { 
                            nativeEvent: {
                                contentOffset: {
                                    y: scrollY
                                }
                            }
                        }
                    ], {useNativeDriver: false})
                }

                showsVerticalScrollIndicator={false}
            />
            
            {/* ---------- ImagePicker Popup ---------- */}

            {
                isImagePickerPopUpOpen ? 
                    <Animated.View
                        style={[{
                            position: 'absolute',
                            width: 200,
                            height: 100,
                            backgroundColor: theme[100],
                            left: width / 2 - 100,
                            top: height / 3,
                            zIndex: 500,
                            borderRadius: 20,
                            elevation: 5,
                        }, imagePickerPopUpAnimatedValues]}
                    >
                        <TouchableOpacity
                            style={{
                                width: '100%',
                                height: '50%',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                pickImage()
                                toggleImagePickerPopUp()
                            }}
                        >
                            <Text>Select from gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                width: '100%',
                                height: '50%',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                takeImage()
                                toggleImagePickerPopUp()
                            }}
                        >
                            <Text>Use camera</Text>
                        </TouchableOpacity>
                    </Animated.View>

                :

                <></>
            }    
            
            {
                isImagePickerPopUpOpen ? 
                    <Animated.View
                        style={[{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            zIndex: 20,
                        }, imagePickerBackgroundAnimatedValue]}
                        // accessible={false}
                        onTouchEnd={() => {
                            toggleImagePickerPopUp();
                        }}
                    >

                    </Animated.View>

                :

                <></>
            }    




        </SafeAreaView>
    )
}

export default Profile;