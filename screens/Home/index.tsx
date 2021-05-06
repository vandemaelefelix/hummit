import React, { useEffect, useState } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';



import * as FileSystem from 'expo-file-system';

import Home from './Home';
import Profile from './Profile';
import { Animated, Dimensions, Easing, TouchableOpacity, View, Text, TextInput, Keyboard, StatusBar } from 'react-native';
import {Picker} from '@react-native-picker/picker';

import { theme } from '../../styles/colors/theme';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { Audio } from 'expo-av';

import firebase from 'firebase';
import 'firebase/firestore';
import { tabNavBar } from '../../styles/components/tabNavBar';

import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

import Constants from 'expo-constants';
import SoundWave from '../../components/SoundWave';
import CustomTabLabel from '../../components/CustomTabLabel';
import * as Permissions from 'expo-permissions';
import { usePermissions } from 'expo-permissions';

const Tab = createMaterialTopTabNavigator();
// const Tab = createMaterialBottomTabNavigator();

const index = ({ navigation } : any) => {
    const [permission, askForPermission] = usePermissions(Permissions.CAMERA, { ask: true });
    // ! Mag weg
    const { height, width } = Dimensions.get("window");

    const formHeight = height / 10 * 4 + 30;

    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();
    const [canStop, setCanStop] = useState(false);
    const [metering, setMetering] = useState<Array<number>>([])

    // const [loadingBarTransform, setLoadingBarTransform] = useState([{translateX: - width}])

    // State for loading animation
    const [loadingAnimation, setLoadingAnimation] = useState(new Animated.Value(-width));
    const loadingBarTransform = {
        transform: [{translateX: loadingAnimation}]
    };

    // State for form animation
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [formAnimation, setFormAnimation] = useState({
        positionY: new Animated.Value(isFormOpen ? 0 : formHeight)
    });
    const animatedTransform = {
        transform: [{translateY: formAnimation.positionY}],
    } 

    const [descriptionValue, setDescriptionValue] = useState<string | undefined>();
    const [privacyMode, setPrivacyMode] = useState<number>(0);
    
    useEffect(() => {
        checkIfLoggedIn();
    });

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                navigation.navigate('Login', { error: 'not logged in' });
            }
        })
    }

    const reduceArraySize = (array: Array<number>, outputSize: number): Array<number> => {
        let reducedArray: Array<number> = [];
        console.log(array.length);
    
        if (array.length > outputSize) {
            let averageNumber = Math.floor(array.length / outputSize);
            
            for (let i = 0; i < outputSize; i++) {
                let average = (arr: any) => arr.reduce((a: any, b: any) => a + b) / arr.length;
                if (i == outputSize - 1) {
                    reducedArray.push(Math.floor(average(array.slice(i, outputSize))))
                } else {
                    reducedArray.push(Math.floor(average(array.slice(i, i+averageNumber))))
                }
            }
        } else {
            console.log(Math.floor(outputSize / array.length))
            const rest = outputSize - (array.length * Math.floor(outputSize / array.length));
            let restCount = 0;
            console.log(rest)
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < Math.floor(outputSize / array.length); j++) {
                    reducedArray.push(array[i])
                }
                if (restCount < rest) {
                    reducedArray.push(array[i]);
                    restCount+=1;
                }
            }
    
            console.log(reducedArray.length)
        }
    
        return reducedArray;
    }

    async function startRecording() {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            }); 
  
            // Start recording
            console.log('Starting recording..');

            const _recording = new Audio.Recording();
            _recording.setOnRecordingStatusUpdate(async (rec) => {
                // console.log(isRecording)
                // console.log(rec.metering);
                if (rec && rec.metering) {
                    let arr = metering;
                    arr.push(rec.metering);
                    setMetering(arr);
                }
                
            })
            _recording.setProgressUpdateInterval(100);
            await _recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        
            setRecording(_recording);
            await _recording.startAsync();
  
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }
    
    async function stopRecording() {
        try {
            // @ts-ignore
            await recording.stopAndUnloadAsync();
        } catch (error) {
            console.error(error);
        }
        // @ts-ignore
        const info = await FileSystem.getInfoAsync(recording.getURI());        
        setIsRecording(false);
        console.log('Metering: 😎', metering);

        console.log('recording stopped')
    }

    const saveRecording = async (description: string, privacy: number) => {

        const uri: string | null | undefined = recording?.getURI();

        if (uri) {
            let response = await fetch(uri);
            let blob = await response.blob();


            const firestoreRef = firebase.firestore().collection('posts').doc();

            firebase.storage().ref().child(`recordings/${currentUser?.uid}/${firestoreRef.id}.m4a`)
            .put(blob).then((snapshot) => {
                
                snapshot.ref.getDownloadURL().then((url) => {
                    firestoreRef.set({
                        created_at: Date.now(),
                        description: description,
                        privacy: privacy, 
                        recording: url,
                        recordingDuration: recording?._finalDurationMillis,
                        userId: currentUser?.uid,
                        finished: false,
                        metering: metering,
                        // metering: reduceArraySize(metering, 30)
                    });
                });
            });
            console.log('Uploaded successfully: 🎉🎉🎉');

        }
    }


    const toggleForm = () => {
        setIsFormOpen((state: boolean) => {
            console.info('Sign in form is: ', isFormOpen);
            Animated.timing(formAnimation.positionY, {
                toValue: state ? formHeight : 20,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.in(Easing.elastic(1)),
            }).start();

            console.log('Sign in form: ', state ? false : true);
            setIsFormOpen(state ? false : true);
            return state;
        });
    }

    
    return (
        <SafeAreaProvider>
            {/* <StatusBar backgroundColor="#FFF" barStyle="dark-content"/> */}
            <Tab.Navigator
                tabBarPosition='bottom'
                tabBarOptions={{
                    tabStyle: {backgroundColor: theme[100], height: 60},
                    keyboardHidesTabBar: true,
                    indicatorStyle: {
                        height: '100%',
                        backgroundColor: '#ff6900'
                    },
                }}
                screenOptions={({ route }) => ({
                    tabBarLabel: ({ focused }) => {
                        return focused
                            ? (<CustomTabLabel isFocused={focused} page={route.name}/>)
                            : (<CustomTabLabel isFocused={focused} page={route.name}/>)
                    },
                    
                })}
            >
                <Tab.Screen 
                    name="Home" 
                    component={Home}
                />
                <Tab.Screen 
                    name="Profile" 
                    component={Profile}
                />
            </Tab.Navigator>

            {/* --------- Record Button ---------- */}
            <TouchableOpacity
                onPressOut={() => {
                    
                    Animated.timing(loadingAnimation, {
                        toValue: 0,
                        duration: 30000,
                        useNativeDriver: true,
                    }).stop()

                    if (canStop) {
                        stopRecording();
                        toggleForm();
                    }
                    setCanStop(false);
                    
                }}

                onLongPress={(e) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Animated.timing(loadingAnimation, {
                        toValue: 0,
                        duration: 30000,
                        useNativeDriver: true,
                    }).start();
                    setCanStop(true);
                    startRecording();
                }}
                delayLongPress={150}

                style={{
                    position: 'absolute',
                    width: 100,
                    height: 100,
                    bottom: 10,
                    alignSelf: 'center',
                }}
            >
                <Svg style={{
                    width: '100%',
                    height: '100%',
                }} viewBox="0 0 78 77.999">
                    <Defs>
                        <LinearGradient
                            id="prefix__b"
                            x1={0.5}
                            x2={0.5}
                            y2={1}
                            gradientUnits="objectBoundingBox"
                        >
                            <Stop offset={0} stopColor="#a800ff" />
                            <Stop offset={1} stopColor="#d11fd0" />
                        </LinearGradient>
                    </Defs>
                    <G
                        transform="translate(-.002 -.002)"
                        data-name="Add Button"
                    >
                        <Path
                            data-name="Exclusion 1"
                            d="M30 60A30.008 30.008 0 0118.323 2.358a30.007 30.007 0 0123.354 55.284A29.813 29.813 0 0130 60zm0-45a15 15 0 1015 15 15.017 15.017 0 00-15-15z"
                            transform="translate(9 9)"
                            fill="url(#prefix__b)"
                        />
                    </G>
                </Svg>
            </TouchableOpacity>
                

            {/* --------- LOADING BAR ---------- */}
            <Animated.View
                style={[{
                    width: width,
                    height: 5,
                    backgroundColor: theme[800],
                    position: 'absolute',
                    top: Constants.statusBarHeight,
                }, loadingBarTransform.transform]}
                accessibilityRole='progressbar'
            >
            </Animated.View> 

            {/* ---------- Save Recording Popup ---------- */}
            <Animated.View
                style={[tabNavBar.form, animatedTransform]}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        toggleForm();
                        Animated.timing(loadingAnimation, {
                            toValue: -width,
                            duration: 150,
                            useNativeDriver: true,
                            easing: Easing.inOut(Easing.quad),
                        }).start()
                        setDescriptionValue(undefined);
                        setPrivacyMode(0)
                    }}
                    style={[tabNavBar.closeFormButton]}
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
                
                <View style={[tabNavBar.container]}>
                    <View style={[tabNavBar.formFieldContainer]}>
                        <Text style={[tabNavBar.label]}>Add a description</Text>
                        <TextInput
                            style={[tabNavBar.textInput]}
                            placeholder='Description'
                            multiline={true}
                            onChangeText={(value) => setDescriptionValue(value)}
                            value={descriptionValue}
                            maxLength={100}
                        >
                        </TextInput>
                    </View>

                    <View style={[tabNavBar.pickerContainer]}>
                        <Text style={[tabNavBar.label]}>Who can see this?</Text>
                        <Picker
                            selectedValue={privacyMode}
                            onValueChange={(value, index) => {setPrivacyMode(value)}}
                            style={[tabNavBar.picker]}
                        >
                            <Picker.Item label="Everyone" value={0} />
                            <Picker.Item label="Only friends" value={1} />
                        </Picker>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            saveRecording(descriptionValue ? descriptionValue : '', privacyMode ? privacyMode : 0);
                            Animated.timing(loadingAnimation, {
                                toValue: -width,
                                duration: 150,
                                useNativeDriver: true,
                                easing: Easing.inOut(Easing.quad),
                            }).start()
                            Keyboard.dismiss();
                            toggleForm();
                        }}

                        style={[tabNavBar.formButton]}
                    >
                        <Text style={[tabNavBar.formButtonText]}>POST</Text>
                    </TouchableOpacity>
                </View>

                
            </Animated.View>

        </SafeAreaProvider>
    )
}

export default index;