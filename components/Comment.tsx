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

import { comments } from '../styles/components/comments';
import { theme } from '../styles/colors/theme';

const Comment = (props: any) => {
    const [profileData, setProfileData] = useState<firebase.firestore.DocumentData | undefined>();
    const [isCorrect, setIsCorrect] = useState<boolean>(props.comment.item.isCorrect);
    const [canChange, setCanChange] = useState<boolean>(false);

    const getProfileData = () => {

        firebase.firestore().collection('users').doc('UjrAxRr8FoYIdkH2TzlvZx1sQd13')
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

    const updateIsCorrect = async (commentId: string, isCorrect: boolean) => {
        console.log(commentId);
        await firebase.firestore().collection('comments')
        .doc(commentId)
        .update({
            isCorrect: isCorrect
        })
    }

    const toggleIsCorrect = async () => {
        updateIsCorrect(props.comment.item.id, !isCorrect)
        setIsCorrect(!isCorrect);
    }

    return (
        <View style={[comments.commentContainer]}>
            <Image
                style={[comments.commentProfilePic]}
                source={profileData?.profile_picture ? {uri: profileData.profile_picture} : require('../assets/icon.png')}
            />
            <TouchableOpacity
                onLongPress={() => {
                    if (props.isProfilePage) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleIsCorrect();
                    }
                }}
                delayLongPress={150}
                style={[comments.commentTextContainer]}
                activeOpacity={1}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingBottom: 4
                    }}
                >
                    <Text style={[comments.commentName]}>
                        {profileData ? `${profileData.first_name} ${profileData.last_name}` : ''}
                    </Text>
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
                        {calcTime(new Date(Date.now()), new Date(props.comment.item.created_at))}    
                    </Text> 
                </View>
                <Text
                    style={[comments.commentText]}
                >
                    {props.comment.item.text}
                </Text>


                {
                    isCorrect ?
                    <View 
                        style={{
                            position: 'absolute',
                            backgroundColor: theme.checkmark,
                            width: 24,
                            height: 24,
                            top: 8,
                            right: 8,
                            borderRadius: 8,
                            padding: 6,
                        }}
                    >
                        <Svg style={{width: '100%', height: '100%', }} viewBox="0 0 19.585 15.208">
                            <Path
                                fill="white"
                                data-name="Path 19"
                                d="M7.499 14.915a1 1 0 01-1.414 0L.439 9.268a1.5 1.5 0 010-2.121l.707-.707a1.5 1.5 0 012.121 0l3.525 3.525L16.317.44a1.5 1.5 0 012.121 0l.707.707a1.5 1.5 0 010 2.121z"
                            />
                        </Svg>
                    </View>
                    : 
                    <></>
                }
            </TouchableOpacity>

        </View>
    )
}

export default Comment;

