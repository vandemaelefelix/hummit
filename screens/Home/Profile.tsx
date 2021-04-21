import React, { useEffect, useState } from 'react';

import { Dimensions, Text, TouchableOpacity, View, Image, FlatList, RefreshControl, Animated, ScrollResponderEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../styles/colors/theme';

import firebase from 'firebase';
import 'firebase/firestore';
import Header from '../../components/Header';
import { profile } from '../../styles/components/profile';
import Post from '../../components/Post';
import Svg, { Path } from 'react-native-svg';

const { height, width } = Dimensions.get("window");

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

    // TODO: Create scroll animation to hide header

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

    return (
        <SafeAreaView  style={{backgroundColor: theme[100]}}>
            {/* <Header isProfilePage={true} showProfilePicture={true} userId={currentUser?.uid}/> */}
            <Animated.View 
                style={[profile.header]}
            >
                
                <View
                    style={[profile.headerContent]}
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

                </View>

                <Image
                    source={require('../../assets/background.png')}
                    style={[profile.headerBackground]}
                >
                </Image>
            </Animated.View>

            <FlatList
                contentContainerStyle={{ paddingBottom: 450, minHeight: '90%' , paddingTop: 16}}
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
                onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                    if (e.nativeEvent.contentOffset.y > 50) {
                        
                    }
                    // console.log(e.nativeEvent.contentOffset)
                }}
            />

        </SafeAreaView>
    )
}

export default Profile;