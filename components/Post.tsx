import React, { useEffect, useState } from 'react';

import { Text, TouchableOpacity, View, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post } from '../styles/components/post';
import SoundWave from './SoundWave';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';
import Svg, { G, Path } from 'react-native-svg';

type Profile = {
    created_at: number;
    email: string;
    first_name: string;
    last_name: string;
    locale: string;
    profile_picture: string;
};

const Post = (props: any) => {
    const {postData, showComments} = props;
    const [profileData, setProfileData] = useState<firebase.firestore.DocumentData | Profile | null>();

    const getProfileData = () => {

        firebase.firestore().collection('users').doc(postData.userId)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    // console.log("Document data:", doc.data());
                    setProfileData(doc.data());
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
    }

    useEffect(() => {
        getProfileData()
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

    return (
        <View style={[post.container ]} key={postData.id.toString()}>
            <View style={[post.titleBox]}>
                <Image style={[post.profilePic]} source={profileData?.profile_picture ? {uri: profileData.profile_picture} : require('../assets/profile_empty.png')} />
                <View style={{ marginLeft: 16,}}>
                    <Text style={[post.name]}>{profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Anonymous'}</Text>
                    <Text>{calcTime(new Date(Date.now()), postData.created_at)}</Text>
                </View>
            </View>
            <Text style={[post.description]}>{postData.description}</Text>

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