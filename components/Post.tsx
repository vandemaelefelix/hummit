import React, { useEffect, useState } from 'react';

import { Text, TouchableOpacity, View, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post } from '../styles/components/post';
import SoundWave from './SoundWave';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';
import Svg, { G, Path } from 'react-native-svg';

import { useNavigation, useRoute } from '@react-navigation/native';
import { profile } from '../styles/components/profile';

type Profile = {
    created_at: number;
    email: string;
    first_name: string;
    last_name: string;
    locale: string;
    profile_picture: string;
    display_name: string;
};

const Post = (props: any) => {
    const navigation = useNavigation();
    const route = useRoute().name;
    const {postData, showComments} = props;
    const [profileData, setProfileData] = useState<firebase.firestore.DocumentData | Profile | null>();
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();


    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if (user) {
                setCurrentUser(user);
            } else {
                firebase.auth().signOut()
                navigation.navigate('Login', { error: 'not logged in' });
            }
        })
    }

    const getProfileData = () => {

        firebase.firestore().collection('users').doc(postData.userId)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    setProfileData(doc.data());
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
    }

    useEffect(() => {
        getProfileData();
        checkIfLoggedIn();
    }, [])

    const calcTime = (current: Date, previous: Date) => {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;
        
        // @ts-ignore
        var elapsed = current - previous;
        
        if (elapsed < msPerMinute) {
            return 'now';   
        }
        
        else if (elapsed < msPerHour) {
            return Math.round(elapsed/msPerMinute) + ' min ago';   
        }
        
        else if (elapsed < msPerDay ) {
            return Math.round(elapsed/msPerHour ) + 'h ago';   
        }

        else if (elapsed < msPerMonth) {
            return Math.round(elapsed/msPerDay) + (Math.round(elapsed/msPerDay) == 1 ? ' day ago' : ' days ago');   
        }
        
        else if (elapsed < msPerYear) {
            return Math.round(elapsed/msPerMonth) + (Math.round(elapsed/msPerMonth) == 1 ? ' month ago' : ' month ago');   
        }
        
        else {
            return Math.round(elapsed/msPerYear ) + (Math.round(elapsed/msPerYear ) == 1 ? ' year ago' : ' years ago');   
        }
    }

    const deletePost = (post_id: string) => {
        firebase.firestore().collection('posts')
        .doc(post_id)
        .delete()

        firebase.firestore().collection('comments')
        .where('post_id', '==', post_id).get()
        .then((querySnapshot) => {
            var batch = firebase.firestore().batch();

            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            return batch.commit();
        })
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    return (
        <View style={[post.container ]} key={postData.id.toString()}>
            <TouchableOpacity 
                style={[post.titleBox]}
                onPress={() => {
                    if (currentUser && currentUser.uid) {
                        if (currentUser.uid === postData.userId) {
                            console.log('Post of logged in user')
                            navigation.navigate('Profile');
                        } else {
                            // TODO: Navigate to Profile of other user with ID: postData.userId
                            navigation.navigate('OtherProfile', {userId: postData.userId});
                        }
                    }
                }}
                activeOpacity={1}
            >
                <Image style={[post.profilePic]} source={profileData?.profile_picture ? {uri: profileData.profile_picture} : require('../assets/profile_empty.png')} />
                <View style={{ marginLeft: 16,}}>

                    {
                        postData.userId != currentUser?.uid ?
                            profileData ? 
                                profileData.display_name != undefined && profileData.display_name != '' ?
                                <Text style={[post.name]}>{profileData ? profileData.display_name : 'Anonymous'}</Text>
                                :
                                <Text style={[post.name]}>{profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Anonymous'}</Text>
                            :
                            <Text style={[post.name]}>Anonymous</Text>
                        :
                        <Text style={[post.name]}>{profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Anonymous'}</Text>
                    }

                    <Text>{calcTime(new Date(Date.now()), postData.created_at)}</Text>
                </View>
                {
                    postData.userId == currentUser?.uid ?
                    <TouchableOpacity
                        style={{
                            width: '7%',
                            aspectRatio: 1,
                            position: 'absolute',
                            right: 0,
                        }}

                        onPress={() => {
                            deletePost(postData.id);
                        }}
                    >
                        <Svg viewBox="0 0 416 512">
                            <Path
                                data-name="Path 25"
                                fill="#000"
                                d="M376 64h-88V48a48.055 48.055 0 00-48-48h-64a48.055 48.055 0 00-48 48v16H40a40.045 40.045 0 00-40 40v56a16 16 0 0016 16h8.744l13.823 290.283A47.942 47.942 0 0086.512 512h242.976a47.941 47.941 0 0047.945-45.717L391.256 176H400a16 16 0 0016-16v-56a40.045 40.045 0 00-40-40zM160 48a16.019 16.019 0 0116-16h64a16.019 16.019 0 0116 16v16h-96zM32 104a8.009 8.009 0 018-8h336a8.009 8.009 0 018 8v40H32zm313.469 360.761A15.981 15.981 0 01329.488 480H86.512a15.979 15.979 0 01-15.981-15.239L56.78 176h302.44z"
                            />
                            <Path
                                data-name="Path 26"
                                fill="#000"
                                d="M208 448a16 16 0 0016-16V224a16 16 0 00-32 0v208a16 16 0 0016 16z"
                            />
                            <Path
                                data-name="Path 27"
                                fill="#000"
                                d="M288 448a16 16 0 0016-16V224a16 16 0 00-32 0v208a16 16 0 0016 16z"
                            />
                            <Path
                                data-name="Path 28"
                                fill="#000"
                                d="M128 448a16 16 0 0016-16V224a16 16 0 00-32 0v208a16 16 0 0016 16z"
                            />
                        </Svg>
                    </TouchableOpacity>
                    :
                    <></>
                }
            </TouchableOpacity>
            {
                postData.description != '' ?
                    <Text style={[post.description]}>{postData.description}</Text>
                :
                <></>
            }

            <SoundWave postId={1} memo={postData.recording} duration={postData.recordingDuration} metering={postData.metering}></SoundWave>

            <TouchableOpacity
                onPress={() => {
                    showComments(postData.id)
                }}
                style={[post.commentButton]}
            >

                <Svg style={[post.commentButtonIcon]} viewBox="0 0 14.999 13.828">
                    <G data-name="Path 18" fill="none">
                        <Path d="M11.999 0a3 3 0 013 3v10.828l-4.866-3.373H2.999a3 3 0 01-3-3V3a3 3 0 013-3z" />
                        <Path
                        d="M3 1c-1.103 0-2 .897-2 2v4.455c0 1.103.897 2 2 2h7.445l.257.178L14 11.918V3c0-1.103-.897-2-2-2H3m0-1h9a3 3 0 013 3v10.828l-4.866-3.373H2.999a3 3 0 01-3-3V3a3 3 0 013-3z"
                        fill="#000"
                        />
                    </G>
                </Svg>

                <Text style={[post.commentButtonText]}>Comment</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Post;