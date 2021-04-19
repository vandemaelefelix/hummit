import React, { useEffect, useState } from 'react';

import { Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post } from '../styles/components/post';
import SoundWave from './SoundWave';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';

type Profile = {
    created_at: number;
    email: string;
    first_name: string;
    last_name: string;
    locale: string;
    profile_picture: string;
};

const Post = (props: any) => {
    const {postData} = props;
    const [profileData, setProfileData] = useState<Profile | null>();

    const getProfileData = () => {
        firebase.database().ref('users').child(postData.userId).once('value', (snapshot) => {
            const rec = snapshot.val();
            console.log('😀', rec)
            setProfileData(rec);
        });
    }

    const calcTime = (current: Date, previous: Date) => {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;
        
        // @ts-ignore
        var elapsed = current - previous;
        
        if (elapsed < msPerMinute) {
            return Math.round(elapsed/1000) + ' seconds ago';   
        }
        
        else if (elapsed < msPerHour) {
            return Math.round(elapsed/msPerMinute) + ' minutes ago';   
        }
        
        else if (elapsed < msPerDay ) {
            return Math.round(elapsed/msPerHour ) + ' hours ago';   
        }

        else if (elapsed < msPerMonth) {
            return Math.round(elapsed/msPerDay) + ' days ago';   
        }
        
        else if (elapsed < msPerYear) {
            return Math.round(elapsed/msPerMonth) + ' months ago';   
        }
        
        else {
            return Math.round(elapsed/msPerYear ) + ' years ago';   
        }
    }

    useEffect(() => {
        getProfileData()
    }, [])

    return (
        <View style={[post.container ]} key={postData.id.toString()}>
            <View style={[post.titleBox]}>
                <Image style={[post.profilePic]} source={profileData?.profile_picture ? {uri: profileData.profile_picture} : require('../assets/icon.png')} />
                <View style={{ marginLeft: 16,}}>
                    <Text style={[post.name]}>{profileData ? `${profileData.first_name} ${profileData.last_name}` : ''}</Text>
                    <Text>{calcTime(new Date(Date.now()), postData.created_at)}</Text>
                </View>
            </View>
            <Text style={[post.description]}>{postData.description}</Text>

            <SoundWave postId={1} memo={postData.recording} duration={postData.recordingDuration}></SoundWave>

            <TouchableOpacity
                onPress={() => {console.log(calcTime(new Date(Date.now()), new Date(1515294645437)))}}
            >
                <Text>Comment</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Post;