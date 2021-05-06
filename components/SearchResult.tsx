import React, { useEffect, useState } from 'react';

import { Text, TouchableOpacity, View, Image, Animated, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post } from '../styles/components/post';
import SoundWave from './SoundWave';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';
import Svg, { G, Path } from 'react-native-svg';

import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

import { comments } from '../styles/components/comments';
import { theme } from '../styles/colors/theme';
import { search } from '../styles/components/search';

const SearchResult = (props: any) => {
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState<firebase.firestore.DocumentData | undefined>();
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if (user) {
                setCurrentUser(user);
                getProfileData(user.uid);
            } else {
                firebase.auth().signOut()
                navigation.navigate('Login', { error: 'not logged in' });
            }
        })
    }

    const getProfileData = (userId: string) => {
        firebase.firestore().collection('users').doc(userId)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    setProfileData(doc.data());
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
    }

    const compareFriends = (array1: string[], array2: string[]): string[] => {
        let commonFriends: string[] = [];

        array1.forEach((friend: string) => {
            if (array2.includes(friend)) {
                commonFriends.push(friend);
            }
        })
        
        return commonFriends;
    }

    const getUserInfo = (current_user: any, searched_user: any) => {
        if (current_user && searched_user) {
            if (current_user.friends.includes(searched_user.id)) {
                return 'Friend';
            } else if (currentUser?.uid == searched_user.id) {
                return 'You';
            } else {
                const commonFriends = compareFriends(current_user.friends, searched_user.friends);
                if (commonFriends.length > 1) {
                    return `${commonFriends.length} mutual friends`;
                } else if (commonFriends.length == 0) {
                    return `No mutual friends`;
                } else {
                    return `${commonFriends.length} mutual friend`;
                }
            }
        } else {
            return 'Test';
        }

    }

    useEffect(() => {
        checkIfLoggedIn();
    }, [])

    return (
        <View style={[search.searchResultContainer]} >
            <TouchableOpacity 
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,

                }}
                onPress={() => {
                    console.log(currentUser)
                    if (currentUser) {
                        if (currentUser.uid === props.profile.id) {
                            navigation.navigate('Profile');
                        } else {
                            navigation.navigate('OtherProfile', {userId: props.profile.id});
                        }
                        props.toggleSearchSection('hide');
                    }
                }}
            >
                {
                    props.profile.profile_picture 
                    ?
                    <Image style={[search.userProfilePic]} source={{uri : props.profile.profile_picture}} />
                    :
                    <Image style={[search.userProfilePic]} source={require('../assets/profile_empty.png')} />

                }
                {
                    props.profile.display_name
                    ?
                    <Text style={[search.userName]}>{props.profile.display_name}</Text>
                    :
                    <Text style={[search.userName]}>{props.profile.first_name} {props.profile.last_name}</Text>
                }
                <View style={{
                    width: 5,
                    height: 5,
                    backgroundColor: 'gray',
                    borderRadius: 50,
                    alignSelf: 'center',
                    marginLeft: 8
                }}></View>
                <Text style={{
                    fontSize: 12,
                    lineHeight: 12,
                    marginLeft: 8,
                    color: 'gray'
                }}>
                    {getUserInfo(profileData, props.profile)}    
                </Text> 
            </TouchableOpacity>
        </View>
    )
}

export default SearchResult;

