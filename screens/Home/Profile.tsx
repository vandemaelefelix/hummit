import React, { useEffect, useRef, useState } from 'react';

import { Dimensions, Text, TouchableOpacity, View, Image, FlatList, RefreshControl, Animated, ScrollResponderEvent, NativeSyntheticEvent, NativeScrollEvent, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../styles/colors/theme';

import firebase from 'firebase';
import 'firebase/firestore';
import Header from '../../components/Header';
import { profile } from '../../styles/components/profile';
import Post from '../../components/Post';
import Svg, { Path } from 'react-native-svg';
import { header } from '../../styles/components/header';

const { height, width } = Dimensions.get("window");

const HEADER_EXPANDED_HEIGHT = height / 10 * 4;
console.log(height)
// const HEADER_EXPANDED_HEIGHT = 400;
const HEADER_COLLAPSED_HEIGHT = 60

const Profile = ({ navigation } : any) => {
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();
    const [profileData, setProfileData] = useState<firebase.firestore.DocumentData | undefined>();
    const [data, setData] = useState<firebase.firestore.DocumentData[]>([]);
    const [isFetching, setIsFetching] = useState(false);


    
    useEffect(() => {
        checkIfLoggedIn();
        getPosts();
    }, []);

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
                getProfileData(user.uid);
            } else {
                firebase.auth().signOut()
                navigation.navigate('Login', { error: 'not logged in' });
            }
        })
    }


    // ! ========== Filling Posts Flatlist ==========
    const showCommentSection = () => {
        console.log('Show comments')
    }

    const renderPost = ({item}: any) => {
        return (
            <Post postData={item} showComments={showCommentSection} ></Post>
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
    }

    const getPosts = async () => {
        if (!isFetching) setIsFetching(true);
        await firebase.firestore().collection("posts").orderBy('created_at', 'desc').where('finished', '==', false)
            .get()
            .then((querySnapshot) => {
                let newData: firebase.firestore.DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    //@ts-ignore
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

    // TODO: ========== Test Scroll Animation ==========
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
        inputRange: [250, HEADER_EXPANDED_HEIGHT-HEADER_COLLAPSED_HEIGHT],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    }); 

    // TODO: ========== Test Scroll Animation ==========

    return (
        <SafeAreaView  style={{backgroundColor: theme[100]}}>
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
                            source={profileData ? {uri: profileData.profile_picture} : require('../../assets/profile_empty.png')}
                            style={[profile.profilePicture]}
                        >
                        </Image>
                        <TouchableOpacity style={[profile.editProfilePicture]}>
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
                        <Text style={[profile.nameText]}>Felix</Text>
                        <Text style={[profile.nameText]}>Vandemaele</Text>
                    </View>

                    <View style={[profile.info]}>
                        <View style={[profile.friends]}>
                            <Text style={[profile.infoNumber]}>150</Text>
                            <Text style={[profile.infoText]}>Friends</Text>
                        </View>
                        <View style={[profile.points]}>
                            <Text style={[profile.infoNumber]}>390</Text>
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
                <Text style={[header.logo]}>Felix Vandemaele</Text>
            </Animated.View>

            <FlatList
                contentContainerStyle={{ paddingBottom: 0,  paddingTop: HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT - 16}}
                data={data} 
                renderItem={renderPost}
                keyExtractor={(post): any => post.id.toString()}
                refreshControl={
                    <RefreshControl
                        onRefresh={() => getPosts()}
                        refreshing={isFetching}
                        title="Pull to refresh"
                        tintColor="#474574"
                        titleColor="#474574"
                    />
                }

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

        </SafeAreaView>
    )
}

export default Profile;