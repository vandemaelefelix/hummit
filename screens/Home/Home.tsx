import React, { useEffect, useRef, useState } from 'react';

import { FlatList, TouchableOpacity, View, RefreshControl, Animated, Dimensions, Easing, Keyboard, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Path } from 'react-native-svg';

import { theme } from '../../styles/colors/theme';

import Header from '../../components/Header';
import Post from '../../components/Post';

import firebase from 'firebase';
import 'firebase/firestore';
import CommentSection from '../../components/CommentSection';
const { height, width } = Dimensions.get("window");


const Home = ({ navigation } : any) => {
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();
    
    useEffect(() => {
        checkIfLoggedIn();
        getPosts();
    }, []);

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                firebase.auth().signOut()
                navigation.navigate('Login', { error: 'not logged in' });
            }
        })
    }
    const [data, setData] = useState<firebase.firestore.DocumentData[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    const renderPost = ({item}: any) => {
        return (
            <Post postData={item} showComments={showCommentSection} ></Post>
        )
    }
    
    // ! ========== Comment Section ==========

    const toggleCommentSection = (hideShow: string | null = null) => {
        if (hideShow != null) {
            if (hideShow == 'hide') {

            } else if (hideShow == 'show') {

            }
        }

        setIsCommentSectionOpen((state: boolean) => {
            Animated.timing(commentSectionAnimation.positionY, {
                toValue: state ? commentSectionHeight : 0,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.in(Easing.elastic(1)),
                // easing: Easing.inOut(Easing.quad),
            }).start();
            
            if (hideShow) {
                if (hideShow == 'hide') {
                    setIsCommentSectionOpen(false);
                } else if (hideShow == 'show') {
                    setIsCommentSectionOpen(true);
                }
            } else {
                setIsCommentSectionOpen(state ? false : true);
            }

            return state;
        });
        if (!isCommentSectionOpen) setComments([]);
    }

    const childRef = useRef();
    const showCommentSection = (postId: string) => {
        childRef.current?.openCommentSection(postId);
    }


    // ! ========== Firebase Read and Write Functions ==========

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

        <SafeAreaView style={{backgroundColor: theme[100], overflow: 'hidden'}}>
            

            <Header showProfilePicture={true} userId={currentUser?.uid}/>
            <FlatList
                contentContainerStyle={{ paddingBottom: 100, minHeight: '90%' , paddingTop: 8}}
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
            />

            <CommentSection ref={childRef} ></CommentSection>
        </SafeAreaView>

    )
}

export default Home;