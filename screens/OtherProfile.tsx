import React, { useEffect, useRef, useState } from 'react';

import { Dimensions, Text, TouchableOpacity, View, Image, FlatList, RefreshControl, Animated, ScrollResponderEvent, NativeSyntheticEvent, NativeScrollEvent, Easing, Keyboard, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { theme } from '../styles/colors/theme';

import firebase from 'firebase';
import 'firebase/firestore';
import Header from '../components/Header';
import { profile } from '../styles/components/profile';
import Post from '../components/Post';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { header } from '../styles/components/header';

import { comments as commentsStyle } from '../styles/components/comments';
import Comment from '../components/Comment';
import CommentSection from '../components/CommentSection';

const { height, width } = Dimensions.get("window");

const HEADER_EXPANDED_HEIGHT = height / 10 * 4;
const HEADER_COLLAPSED_HEIGHT = 60;

import * as ImagePicker from 'expo-image-picker';

const Profile = ({ route, navigation } : any) => {
    const { userId } = route.params;

    // Currently logged in useer
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();

    // ID of the currently logged in user
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();

    // Profile data of the user whose page we are visiting
    const [profileData, setProfileData] = useState<firebase.firestore.DocumentData | undefined>();

    // Boolean is true when the id of the visited user is in friends of the current user 
    const [isFriend, setIsFriend] = useState<boolean | undefined>();

    const [score, setScore] = useState<number>(0);
    const [data, setData] = useState<firebase.firestore.DocumentData[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);


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
        checkIfLoggedIn();

        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
            }
        })();
    }, []);

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if (user) {
                setCurrentUserId(user.uid);
                setCurrentUser(user);
                getCurrentUserData(user.uid);

                getProfileData(userId);
                getPosts(userId);
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
                if (doc && doc != undefined) {
                    setProfileData(doc.data());
                }

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

    const getCurrentUserData = async (user_id: string) => {
        await firebase.firestore()
        .collection('users')
        .doc(user_id).get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data && data.friends.includes(userId)) {
                    setIsFriend(true);
                } else { 
                    setIsFriend(false);
                }
            }
        })
        .catch((error) => {
            console.error("Error getting profile data:", error);
        });
    }

    const removeFriend = (user_id: string) => {
        firebase.firestore().collection('users').doc(currentUserId)
        .update({
            friends: firebase.firestore.FieldValue.arrayRemove(user_id)
        })
        .then(() => {

        })
        .catch((error) => {
            console.error(error)
        })
    }

    const addFriend = (user_id: string) => {
        firebase.firestore().collection('users').doc(currentUserId)
        .update({
            friends: firebase.firestore.FieldValue.arrayUnion(user_id)
        })
        .then(() => {

        })
        .catch((error) => {
            console.error(error)
        })
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
        childRef.current.openCommentSection(postId);
    }

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
                            source={!isRefresh ? (profileData ? (profileData.profile_picture ? {uri: profileData.profile_picture} : require('../assets/profile_empty.png')) : require('../assets/profile_empty.png')) : require('../assets/profile_empty.png')}
                            style={[profile.profilePicture]}
                        >
                        </Image>
                    </View>
                    <View style={[profile.name]}>
                        <Text style={[profile.nameText]}>{profileData ? `${profileData.display_name}` : 'Anonymous'}</Text>
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
                    source={require('../assets/background.png')}
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
                <Text style={[header.logo]}>{profileData ? `${profileData.display_name}` : 'Anonymous'}</Text>
            </Animated.View>

            {/* ---------- Back Button ---------- */}
            <TouchableOpacity
                style={{
                    width: width / 15,
                    aspectRatio: 1,
                    position: 'absolute',
                    top: width / 10,
                    left: (width / 10) / 2,
                    zIndex: 100,
                }}

                onPress={() => {
                    navigation.goBack();
                }}
            >
                <Svg viewBox="0 0 19.621 15.899">
                    <G fill="none" stroke="#000" strokeLinecap="round" strokeWidth={3}>
                        <Path data-name="Line 44" d="M18.122 8.121h-16" />
                        <Path data-name="Line 45" d="M7.779 13.778L2.122 8.12" />
                        <Path data-name="Line 46" d="M7.779 2.121L2.122 7.778" />
                    </G>
                </Svg>
            </TouchableOpacity>

            {/* ---------- Add Friend Button ---------- */}
            <TouchableOpacity
                style={{
                    width: width / 15,
                    aspectRatio: 1,
                    position: 'absolute',
                    top: width / 10,
                    right: (width / 10) / 2,
                    zIndex: 100,
                }}

                onPress={() => {
                    if (isFriend) {
                        removeFriend(userId);
                        setIsFriend(false);
                    } else {
                        addFriend(userId);
                        setIsFriend(true);
                    }
                }}
            >
                {
                    isFriend != undefined && isFriend == true ?
                    <Svg viewBox="0 0 24.842 24">
                        <G data-name="Added Friend" fill="#000">
                            <Path
                                data-name="Path 19"
                                d="M2.892 12.889a.39.39 0 01-.545 0L.169 10.75a.561.561 0 010-.8l.272-.268a.584.584 0 01.817 0l1.357 1.332 3.669-3.608a.584.584 0 01.817 0l.272.268a.561.561 0 010 .8z"
                            />
                            <G data-name="Profile Icon">
                                <G data-name="Path 5">
                                    <Path d="M20.843 23h-12c-1.654 0-3-1.346-3-3 0-3.86 3.14-7 7-7h4c3.86 0 7 3.14 7 7 0 1.654-1.346 3-3 3z" />
                                    <Path d="M12.843 14c-3.308 0-6 2.692-6 6 0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2 0-3.308-2.692-6-6-6h-4m0-2h4a8 8 0 018 8 4 4 0 01-4 4h-12a4 4 0 01-4-4 8 8 0 018-8z" />
                                </G>
                                <G data-name="Path 6">
                                    <Path d="M14.843 9c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" />
                                    <Path d="M14.843 2c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3m0-2a5 5 0 110 10 5 5 0 010-10z" />
                                </G>
                            </G>
                        </G>
                    </Svg>

                    :
                    <Svg viewBox="0 0 26 24">
                        <G data-name="Add Friend" fill="#000">
                            <G data-name="Profile Icon">
                            <G data-name="Path 5" >
                                <Path d="M22.001 23h-12c-1.654 0-3-1.346-3-3 0-3.86 3.14-7 7-7h4c3.86 0 7 3.14 7 7 0 1.654-1.346 3-3 3z" />
                                <Path d="M14.001 14c-3.308 0-6 2.692-6 6 0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2 0-3.308-2.692-6-6-6h-4m0-2h4a8 8 0 018 8 4 4 0 01-4 4h-12a4 4 0 01-4-4 8 8 0 018-8z" />
                            </G>
                            <G data-name="Path 6" >
                                <Path d="M16.001 9c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" />
                                <Path d="M16.001 2c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3m0-2a5 5 0 110 10 5 5 0 010-10z" />
                            </G>
                            </G>
                            <Path
                                data-name="Line 47"
                                stroke="#000"
                                strokeLinecap="round"
                                strokeWidth={2}
                                d="M1 9h6"
                            />
                            <Path
                                data-name="Line 48"
                                stroke="#000"
                                strokeLinecap="round"
                                strokeWidth={2}
                                d="M4 6v6"
                            />
                        </G>
                    </Svg>

                }
            </TouchableOpacity>  

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
                        onRefresh={() => getPosts(userId)}
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

                // showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    )
}

export default Profile;