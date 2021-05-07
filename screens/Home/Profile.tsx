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


const { height, width } = Dimensions.get("window");

const HEADER_EXPANDED_HEIGHT = height / 10 * 4;
const HEADER_COLLAPSED_HEIGHT = 60;

import * as ImagePicker from 'expo-image-picker';
import { openPicker } from 'react-native-image-crop-picker';
import { tabNavBar } from '../../styles/components/tabNavBar';

const Profile = ({ navigation } : any) => {
    const isMountedRef = useRef<boolean | null>(null);
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();
    const [profileData, setProfileData] = useState<firebase.firestore.DocumentData | undefined>();
    const [score, setScore] = useState<number>(0);
    const [data, setData] = useState<firebase.firestore.DocumentData[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);

    // ----- State for image picker popup -----
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

    // ----- State for option menu popup
    const [isOptionMenuPopUpOpen, setIsOptionMenuPopUpOpen] = useState(false)
    const [optionMenuPopUpAnimationScale, setOptionMenuPopUpAnimationScale] = useState(new Animated.Value(0.6));
    const [optionMenuPopUpAnimationOpacity, setOptionMenuPopUpAnimationOpacity] = useState(new Animated.Value(0));
    const optionMenuPopUpAnimatedValues = {
        transform: [{scale: optionMenuPopUpAnimationScale }],
        opacity: optionMenuPopUpAnimationOpacity,
    }

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
    
    useEffect(() => {
        isMountedRef.current = true;

        if (isMountedRef) {
            checkIfLoggedIn();
            (async () => {
                if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
                }
            })();
        }

        return () => {
            isMountedRef.current = false;
        }

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
                    width: '90%',
                    height: height / 6,
                    paddingVertical: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                }}
            >
                <Text
                    style={{
                        fontWeight: '700',
                        fontSize: 18,
                        textAlign: 'center',
                    }}
                >
                    Hold the purple button to start recording 🙂
                </Text>
            </View>
        )
    }
    
    const getProfileData = async (user_id: string) => {
        firebase.firestore()
        .collection('users')
        .doc(user_id)
        .onSnapshot((doc) =>{
            if (doc && doc != undefined) {
                setProfileData(doc.data());
                if (doc.data()?.display_name) {
                    setChangeNameInputValue(doc.data()?.display_name);
                } else {
                    setChangeNameInputValue(`${doc.data()?.first_name} ${doc.data()?.last_name}`);
                }
            }
        });

        firebase.firestore()
        .collection('comments')
        .where('user_id', '==', user_id)
        .onSnapshot((snapshot) => {
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
        firebase.firestore().collection("posts").orderBy('created_at', 'desc').where('userId', '==', userId)
        .onSnapshot((querySnapshot) => {
            let newData: firebase.firestore.DocumentData[] = [];
            querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>) => {
                let data = doc.data();
                data['id'] = doc.id;
                newData.push(data);
            });
            setData(newData);
        });
        setIsFetching(false);
    }

    // ! ========== Comment Section ==========
    const childRef = useRef();

    const showCommentSection = (postId: string) => {
        if(childRef) {
            childRef.current.openCommentSection(postId);
        }
    }


    // ! ========== Image Picker With Crop Function ==========
    
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.1,
        });


        if (!result.cancelled) {
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
            getProfileData(currentUser?.uid ? currentUser?.uid : '');
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

    const updateDisplayName = async (name: string, user_id: string) => {
        console.log('Updating name with: ', name);

        firebase.firestore().collection('users')
        .doc(user_id)
        .update({
            display_name: name
        });

    }

    const toggleImagePickerPopUp = () => {
        if (isOptionMenuPopUpOpen) {
            toggleOptionMenuPopUp();
        }
        
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

    const toggleOptionMenuPopUp = () => {
        if (isImagePickerPopUpOpen) {
            toggleImagePickerPopUp()
        }
        
        Animated.timing(optionMenuPopUpAnimationScale, {
            toValue: isOptionMenuPopUpOpen ? 0.6 : 1,
            duration: 250,
            useNativeDriver: true,
            easing: isOptionMenuPopUpOpen ? Easing.out(Easing.ease) : Easing.in(Easing.elastic(1)),
        }).start();
        
        Animated.timing(imagePickerPopUpAnimationOpacity, {
            toValue: isOptionMenuPopUpOpen ? 0 : 1,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.linear,
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


    // TODO: ========== Change Name ==========
    // State for form animation
    const formHeight = height / 10 * 4 + 30;
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [formAnimation, setFormAnimation] = useState({
        positionY: new Animated.Value(isFormOpen ? 0 : formHeight)
    });
    const animatedTransform = {
        transform: [{translateY: formAnimation.positionY}],
    }

    const [changeNameInputValue, setChangeNameInputValue] = useState('');
    

    const toggleForm = () => {
        setIsFormOpen((state: boolean) => {
            Animated.timing(formAnimation.positionY, {
                toValue: state ? formHeight : 20,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.in(Easing.elastic(1)),
            }).start();

            setIsFormOpen(state ? false : true);
            return state;
        });
    }

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                console.log(e.endCoordinates)
                setIsFormOpen(state => {
                    if (state) {
                        Animated.timing(formAnimation.positionY, {
                            toValue: -e.endCoordinates.height,
                            duration: 0,
                            useNativeDriver: true,
                            easing: Easing.linear,
                        }).start();
                    }

                    return state;
                });
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            (e) => {
                console.log(e.endCoordinates);
                setIsFormOpen(state => {
                    if (state) {
                        Animated.timing(formAnimation.positionY, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                            easing: Easing.linear,
                        }).start();
                    }

                    return state;
                });
            }
        );
        
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);



    return (
        <SafeAreaView  
            style={{
                backgroundColor: theme[100],
                minHeight: height, 
                overflow: 'hidden'
            }}
        >

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
                            // TODO: Some more testing
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
                        <Text style={[profile.nameText]}>{profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Anonymous'}</Text>
                        {
                            profileData && profileData.display_name && profileData.display_name != '' ? 
                                <Text style={[profile.displayName]}>{profileData ? `(${profileData.display_name})` : ''}</Text>
                            :
                            <></>
                        }

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
                    position: 'absolute',
                    top: width / 10,
                    right: (width / 10) / 2,
                    zIndex: 100,
                    transform: [{rotate: '90deg'}],
                }}

                onPress={() => {
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
                            backgroundColor: theme[100],
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

                        <TouchableOpacity
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 16,
                            }}
                            onPress={() => {
                                toggleForm();
                                toggleOptionMenuPopUp();
                            }}
                        >
                            <Text>Change nickname</Text>
                        </TouchableOpacity>
                    </Animated.View>
                :
                <></>
            }    

            <FlatList
                contentContainerStyle={{ 
                    paddingBottom: HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT, 
                    minHeight: height - HEADER_COLLAPSED_HEIGHT, 
                    paddingTop: HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT - 16
                }}
                data={data} 
                renderItem={renderPost}
                keyExtractor={(post): any => post.id.toString()}
                refreshControl={
                    <RefreshControl
                        onRefresh={() => currentUser?.uid ? getPosts(currentUser?.uid ) : console.log('No user logged in')}
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
                isImagePickerPopUpOpen || isOptionMenuPopUpOpen ? 
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
                            if (isImagePickerPopUpOpen) {
                                toggleImagePickerPopUp();
                            }
                            if (isOptionMenuPopUpOpen) {
                                toggleOptionMenuPopUp();
                            }
                        }}
                    >

                    </Animated.View>

                :

                <></>
            }    


             {/* ---------- Change Name Popup ---------- */}
             <Animated.View
                style={[profile.changeNameForm, animatedTransform]}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        toggleForm();
                    }}
                    style={[profile.changeNameCloseButton]}
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
                
                <View style={[profile.changeNameContainer]}>
                    <View style={[profile.changeNameFormFieldContainer]}>
                        <Text style={[profile.changeNameLabel]}>Choose a nickname</Text>
                        <TextInput
                            style={[profile.changeNameTextInput]}
                            placeholder='Description'
                            multiline={true}
                            onChangeText={(value) => {
                                setChangeNameInputValue(value);
                            }}
                            value={changeNameInputValue}
                            maxLength={100}
                        >
                        </TextInput>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            console.log('Saving Name...')
                            Keyboard.dismiss();
                            updateDisplayName(changeNameInputValue, currentUser?.uid);
                            toggleForm();
                        }}

                        style={[profile.changeNameButton]}
                    >
                        <Text style={[profile.changeNameButtonText]}>SAVE</Text>
                    </TouchableOpacity>
                </View>

                
            </Animated.View>



        </SafeAreaView>
    )
}

export default Profile;