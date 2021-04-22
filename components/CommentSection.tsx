import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef  } from 'react';

import { Text, TouchableOpacity, View, Image, Animated, Keyboard, FlatList, TextInput, Easing, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post } from '../styles/components/post';
import SoundWave from './SoundWave';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';
import Svg, { G, Path } from 'react-native-svg';

import Comment from '../components/Comment';
import { comments as commentsStyle} from '../styles/components/comments';
import { theme } from '../styles/colors/theme';

const { height, width } = Dimensions.get("window");

const CommentSection = forwardRef((props: any, ref: any) => {
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();

    useEffect(() => {
        checkIfLoggedIn();
    }, []);

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                firebase.auth().signOut();
                // TODO: Navigate to Sign in page
            }
        })
    }



    const [comments, setComments] = useState<firebase.firestore.DocumentData[]>([]);
    const [commentSectionPostId, setCommentSectionPostId] = useState<string>();
    const [commentInputValue, setCommentInputValue] = useState<string>('');

    // Used for swipe down gesture to close commentsection
    const [onTouchStartComments, setOnTouchStartComments] = useState<number | undefined>()
    const [commentsScrollLocation, setCommentsScrollLocation] = useState<number>(0);

    // State variables / variables for popup-animation
    const commentSectionHeight = height / 10 * 9;
    const [isCommentSectionOpen, setIsCommentSectionOpen] = useState<boolean>(false);
    const [commentSectionAnimation, setCommentSectionAnimation] = useState({
        positionY: new Animated.Value(isCommentSectionOpen ? 0 : commentSectionHeight),
    });
    const commentSectionAnimatedTransform = {
        transform: [{translateY: commentSectionAnimation.positionY}],
    }

    
    // Send Comment Button Color Animation
    const [sendButtonColorAnimation, setSendButtonColorAnimation] = useState(new Animated.Value(0));
    const boxInterpolation =  sendButtonColorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange:['rgb(255,255,255)', 'rgb(168,0,255)'],
    })
    const sendButtonAnimatedColorValue = {
        backgroundColor: boxInterpolation,
    }
    
    // Send Comment Button Translate Animation
    const [sendButtonAnimation, setSendButtonAnimation] = useState(new Animated.Value(0));
    const sendButtonAnimatedTransformValue = {
        transform: [{translateX: sendButtonAnimation}],
    }

    useImperativeHandle(ref, () => ({
        openCommentSection(post_id: string) {
            // console.log('Het werkt');
            setCommentSectionPostId(post_id);
            toggleCommentSection('hide');
            getComments(post_id);
            toggleCommentSection();
        }
    }));

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                console.log(e.endCoordinates)
                setIsCommentSectionOpen(state => {
                    if (state) {
                        Animated.timing(commentSectionAnimation.positionY, {
                            toValue: e.endCoordinates.height,
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
                setIsCommentSectionOpen(state => {
                    if (state) {
                        Animated.timing(commentSectionAnimation.positionY, {
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

    //! =================== FUNCTIONS ======================
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

    const getComments = (postId: string) => {
        firebase.firestore().collection('comments')
        .where('post_id', '==', postId)
        .orderBy('isCorrect', 'desc')
        .orderBy('created_at', 'desc')
        .get()
        .then((snapshot) => {
            let commentsArray: firebase.firestore.DocumentData[] = [];
            snapshot.forEach((doc) => {
                //@ts-ignore
                let comment = doc.data();
                comment['id'] = doc.id;
                commentsArray.push(comment);
            });
            setComments(commentsArray)
        }).catch((error) => {
            console.log("Error getting comments:", error);
        });
    }

    const saveComment = (comment: string, postId: string) => {
        firebase.firestore().collection('comments').doc().set({
            created_at: Date.now(),
            isCorrect: false,
            post_id: postId,
            text: commentInputValue,
            user_id: currentUser?.uid,
        })
        .then(() => {
            getComments(postId);
        })
        .catch((error) => {
            console.error(error);
        })
    }

    const renderComment = (comment: any) => {
        return (
            <Comment isProfilePage={props.isProfilePage} comment={comment} userId={comment.userId}></Comment>
        )
    }

    const animateSendButton = (status: string) => {
        if (status == 'success') {
            Animated.sequence([
                Animated.timing(sendButtonAnimation, {
                    toValue: 50,
                    duration: 350,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(2))
                }),
                Animated.timing(sendButtonAnimation, {
                    toValue: -50,
                    duration: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(sendButtonAnimation, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.elastic(2))
                })
            ]).start(() => {
                animateColors(false);
                setCommentInputValue('');
            })
        } else if(status == 'error') {
            Animated.sequence([
                Animated.timing(sendButtonAnimation, {
                    toValue: -5,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1))
                }),
                Animated.timing(sendButtonAnimation, {
                    toValue: 5,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1))
                }),
                Animated.timing(sendButtonAnimation, {
                    toValue: -5,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1))
                }),
                Animated.timing(sendButtonAnimation, {
                    toValue: 5,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1))
                }),
                Animated.timing(sendButtonAnimation, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.elastic(1))
                })
            ]).start()
        }
    }

    const animateColors = (isIn: boolean) => {
        console.log('Starting animation')
        Animated.timing(sendButtonColorAnimation, {
            toValue: isIn ? 1 : 0,
            duration: 500,
            useNativeDriver: false,
        }).start()
    }



    return (

        <Animated.View
                style={[commentsStyle.commentSection, commentSectionAnimatedTransform]}
                onTouchStart={(e) => {
                    setOnTouchStartComments(e.nativeEvent.locationY);
                }}
                onTouchEnd={(e) => {
                    console.log('OnTouchEnd: ', e.nativeEvent.locationY);
                    if (commentsScrollLocation < 20) {
                        if (onTouchStartComments) {
                            if ((e.nativeEvent.locationY - onTouchStartComments) >= 30) {
                                toggleCommentSection()
                            }
                        }
                    }
                }}
                accessible={true}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        toggleCommentSection('hide');
                    }}
                    style={[commentsStyle.closeCommentsButton]}
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
                
                {
                    comments.length > 0 ?
                    <FlatList
                        data={comments} 
                        renderItem={renderComment}
                        keyExtractor={(comment): any => comment.id.toString()}
                        style={[commentsStyle.container, ]}

                        contentContainerStyle={{
                            paddingBottom: 150,
                        }}
                    >
                    </FlatList>
                    :
                    <View style={[commentsStyle.noComments]}>
                        <Text style={[commentsStyle.noCommentsText]}>Be the first to comment...</Text>
                    </View>
                }
                {/* <FlatList
                    data={comments} 
                    renderItem={renderComment}
                    keyExtractor={(comment): any => comment.id.toString()}
                    style={[commentsStyle.container, ]}
                    onTouchStart={(e) => {
                        setOnTouchStartComments(e.nativeEvent.locationY);
                    }}
                    onTouchEnd={(e) => {
                        if (commentsScrollLocation < 20) {
                            if (onTouchStartComments) {
                                if ((e.nativeEvent.locationY - onTouchStartComments) >= 30) {
                                    toggleCommentSection()
                                }
                            }
                        }
                    }}

                    contentContainerStyle={{
                        paddingBottom: 150,
                    }}
                >
                </FlatList> */}

                <View
                    style={[commentsStyle.commentInputContainer]}
                >   

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '90%',
                        }}
                    >
                        <TextInput
                            placeholder="Write a comment..."
                            onChangeText={(value) => {
                                if (value && value != '') {
                                    animateColors(true);
                                } else {
                                    animateColors(false);
                                }
                                setCommentInputValue(value)
                            }}
                            value={commentInputValue}
                            multiline={true}
                            maxLength={100}
                            style={[commentsStyle.commentInputField]}
                        >
                        </TextInput>

                        <TouchableOpacity
                            onPress={() => {
                                if (commentInputValue && commentInputValue != '') {
                                    saveComment(commentInputValue, commentSectionPostId ? commentSectionPostId : '');
                                    animateSendButton('success');
                                } else {
                                    animateSendButton('error');
                                    console.log('Please fill in a comment!')
                                }
                            }}
                            style={[commentsStyle.sendCommentButton]}
                        >
                            <Animated.View
                                style={[{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                }, sendButtonAnimatedColorValue]}
                            >
                                <Animated.View
                                    style={[{
                                        width: '100%',
                                        height: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }, sendButtonAnimatedTransformValue]}
                                >    
                                    {
                                        commentInputValue ? 
                                            <Svg style={{width: '50%', height: '50%'}} viewBox="0 0 512 441.779">
                                                <Path 
                                                    fill={theme.comments}
                                                    data-name="Path 20"
                                                    d="M481.508 175.224L68.414 3.815A49.442 49.442 0 001.557 61.697l40.594 159.192L1.557 380.081a49.441 49.441 0 0066.857 57.882l413.094-171.409a49.44 49.44 0 000-91.33zm-11.5 63.62L56.916 410.253a19.441 19.441 0 01-26.288-22.764l38.659-151.6h417.722c8.285 0 15.788-6.715 15.788-15s-7.5-15-15.788-15H69.288l-38.66-151.6a19.44 19.44 0 0126.287-22.76l413.094 171.405a19.439 19.439 0 010 35.91z"
                                                />
                                            </Svg>
                                        : 
                                            <Svg style={{width: '50%', height: '50%'}} viewBox="0 0 512 441.779">
                                                <Path 
                                                    fill={'#B7B7B7'}
                                                    data-name="Path 20"
                                                    d="M481.508 175.224L68.414 3.815A49.442 49.442 0 001.557 61.697l40.594 159.192L1.557 380.081a49.441 49.441 0 0066.857 57.882l413.094-171.409a49.44 49.44 0 000-91.33zm-11.5 63.62L56.916 410.253a19.441 19.441 0 01-26.288-22.764l38.659-151.6h417.722c8.285 0 15.788-6.715 15.788-15s-7.5-15-15.788-15H69.288l-38.66-151.6a19.44 19.44 0 0126.287-22.76l413.094 171.405a19.439 19.439 0 010 35.91z"
                                                />
                                            </Svg>
                                    }
                                </Animated.View>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                </View>
            </Animated.View>
    )
})

export default CommentSection;