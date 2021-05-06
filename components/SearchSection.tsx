import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef  } from 'react';

import { Text, TouchableOpacity, View, Image, Animated, Keyboard, FlatList, TextInput, Easing, Dimensions } from 'react-native';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { search } from '../styles/components/search';
import { theme } from '../styles/colors/theme';
import SearchResult from './SearchResult';

const { height, width } = Dimensions.get("window");
import LottieView from 'lottie-react-native';

const SearchSection = forwardRef((props: any, ref: any) => {
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
            }
        })
    }

    const similar = (a: string, b: string) : number => {
        let equivalency: number = 0;
        let minLength: number = (a.length > b.length) ? b.length : a.length;    
        let maxLength: number = (a.length < b.length) ? b.length : a.length;    
        for(let i = 0; i < minLength; i++) {
            if(a[i] == b[i]) {
                equivalency++;
            }
        }
    
        let weight: number = equivalency / maxLength;
        return (weight * 100);
    }

    const getProfiles = (name: string) => {
        firebase.firestore().collection('users')
        .get()
        .then((snapshot) => {
            const similarity_threshold = 30;
            let profiles: firebase.firestore.DocumentData[] = [];
            snapshot.forEach((doc) => {
                let profile = doc.data();
                profile['id'] = doc.id;
                console.log('😁', similar(name, doc.data().first_name));
                if (doc.data().display_name && doc.data().display_name != '') {
                    if (similar(name, doc.data().display_name) > similarity_threshold) {
                        profiles.push(profile);
                    }
                } else {
                    if (similar(name, doc.data().first_name) > similarity_threshold) {
                        profiles.push(profile);
                    } else if (similar(name, doc.data().last_name) > similarity_threshold) {
                        profiles.push(profile);
                    }
                }
            });

            setSearchResults(profiles);
        }).catch((error) => {

            console.log("Error getting comments:", error);
        });
    }

    const lottieRef = useRef(null);

    const [searchResults, setSearchResults] = useState<firebase.firestore.DocumentData[]>([]);
    const [searchInputValue, setSearchInputValue] = useState<string>('');

    // State variables / variables for popup-animation
    const searchSectionHeight = height / 10 * 9;
    const [isSearchSectionOpen, setIsSearchSectionOpen] = useState<boolean>(false);
    const [searchSectionAnimation, setSearchSectionAnimation] = useState({
        positionY: new Animated.Value(isSearchSectionOpen ? 0 : searchSectionHeight),
    });
    const searchSectionAnimatedTransform = {
        transform: [{translateY: searchSectionAnimation.positionY}],
    }

    
    // Send Comment Button Color Animation
    const [searchButtonColorAnimation, setSearchButtonColorAnimation] = useState(new Animated.Value(0));
    const boxInterpolation =  searchButtonColorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange:['rgb(255,255,255)', 'rgb(168,0,255)'],
    })
    const searchButtonAnimatedColorValue = {
        backgroundColor: boxInterpolation,
    }
    
    // Send Comment Button Translate Animation
    const [searchButtonAnimation, setSearchButtonAnimation] = useState(new Animated.Value(0));
    const sendButtonAnimatedTransformValue = {
        transform: [{translateX: searchButtonAnimation}],
    }

    useImperativeHandle(ref, () => ({
        openSearchSection() {
            toggleSearchSection('hide');
            toggleSearchSection();
        }
    }));

    const toggleSearchSection = (hideShow: string | null = null) => {
        if (hideShow != null) {
            if (hideShow == 'hide') {
                setSearchInputValue('');
            } else if (hideShow == 'show') {

            }
        }

        setIsSearchSectionOpen((state: boolean) => {
            Animated.timing(searchSectionAnimation.positionY, {
                toValue: state ? searchSectionHeight : 0,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.in(Easing.elastic(1)),
            }).start();
            
            if (hideShow) {
                if (hideShow == 'hide') {
                    setIsSearchSectionOpen(false);
                } else if (hideShow == 'show') {
                    setIsSearchSectionOpen(true);
                }
            } else {
                setIsSearchSectionOpen(state ? false : true);
            }

            return state;
        });
        if (!isSearchSectionOpen) setSearchResults([]);
    }

    const animateColors = (isIn: boolean) => {
        console.log('Starting animation')
        Animated.timing(searchButtonColorAnimation, {
            toValue: isIn ? 1 : 0,
            duration: 500,
            useNativeDriver: false,
        }).start()
    }

    const animateSendButton = (status: string) => {
        if (status == 'success') {
            Animated.sequence([
                Animated.timing(searchButtonAnimation, {
                    toValue: 50,
                    duration: 350,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(2))
                }),
                Animated.timing(searchButtonAnimation, {
                    toValue: -50,
                    duration: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(searchButtonAnimation, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.elastic(2))
                })
            ]).start();

        } else if(status == 'error') {
            Animated.sequence([
                Animated.timing(searchButtonAnimation, {
                    toValue: -5,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1))
                }),
                Animated.timing(searchButtonAnimation, {
                    toValue: 5,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1))
                }),
                Animated.timing(searchButtonAnimation, {
                    toValue: -5,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1))
                }),
                Animated.timing(searchButtonAnimation, {
                    toValue: 5,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1))
                }),
                Animated.timing(searchButtonAnimation, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.elastic(1))
                })
            ]).start()
        }
    }


    const renderSearchResult = (profile: any) => {
        console.log('😍', profile.item)
        return (
            <SearchResult toggleSearchSection={toggleSearchSection} profile={profile.item}></SearchResult>
        )
    }

    return (

        <Animated.View
                style={[search.searchSection, searchSectionAnimatedTransform]}
                accessible={true}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        toggleSearchSection('hide');
                        setSearchInputValue('');
                        animateColors(false);
                    }}
                    style={[search.closeSearchButton]}
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
                    searchResults.length > 0 ?
                    <FlatList
                        data={searchResults} 
                        renderItem={renderSearchResult}
                        keyExtractor={(result): any => result.id.toString()}
                        style={{width: '90%'}}
                        contentContainerStyle={[search.container, ]}
                    >
                    </FlatList>
                    :

                    <View
                        style={{
                            width: '100%',
                            aspectRatio: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                width: '55%',
                                aspectRatio: 1.3,
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <LottieView
                                ref={lottieRef.current}
                                style={{
                                    width: width,
                                    opacity: 0.5,
                                }}
                                source={require('../assets/search_lottie.json')}
                                loop={true}
                                autoPlay={true}
                                
                            />
                        </View>
                        <Text style={[search.noCommentsText]}> Enter a name to search for.</Text>
                    </View>
                }

                <View
                    style={[search.searchInputContainer]}
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
                            placeholder="Search"
                            onChangeText={(value) => {
                                getProfiles(value);
                                setSearchInputValue(value);
                                if (value && value != '') {
                                    animateColors(true);
                                } else {
                                    animateColors(false);
                                }
                            }}
                            value={searchInputValue}
                            multiline={true}
                            maxLength={100}
                            style={[search.searchInputField]}
                        >
                        </TextInput>

                        {/* <TouchableOpacity
                            onPress={() => {
                                if (searchInputValue && searchInputValue != '') {
                                    getProfiles(searchInputValue);
                                    animateSendButton('success');
                                } else {
                                    animateSendButton('error');
                                }
                            }}
                            style={[search.sendSearchButton]}
                        >
                            <Animated.View
                                style={[{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                }, searchButtonAnimatedColorValue]}
                            >
                                <Animated.View
                                    style={[{
                                        width: '100%',
                                        height: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }, sendButtonAnimatedTransformValue]}
                                >
                                    <Svg style={{width: '50%', height: '50%'}} viewBox="0 0 25.067 25.054">
                                        <G data-name="Search Icon" fill="none" stroke={searchInputValue ? "#fff" : "#000"} strokeWidth={3}>
                                            <G data-name="Ellipse 1">
                                                <Circle cx={10.75} cy={10.75} r={10.75} stroke="none" />
                                                <Circle cx={10.75} cy={10.75} r={9.25} />
                                            </G>
                                            <Path data-name="Line 6" d="M17.422 17.344L24 24" />
                                        </G>
                                    </Svg>

                                </Animated.View>
                            </Animated.View>
                        </TouchableOpacity> */}
                    </View>

                </View>
            </Animated.View>
    )
})

export default SearchSection;