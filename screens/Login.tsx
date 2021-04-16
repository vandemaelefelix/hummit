import React, { useEffect, useState } from 'react';

import { View, Button, Text, TextInput, Animated, Easing, TouchableOpacity, KeyboardAvoidingView, Keyboard, ScreenRect } from 'react-native';
// import { TouchableOpacity} from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Stop, G, Path, Circle}  from "react-native-svg"
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';

import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';

// Styles
import { theme } from '../styles/colors/theme';
import { login } from '../styles/components/Login';
import { firebaseConfig } from '../config';

const { height, width } = Dimensions.get("window");

const Login = ({ navigation } : any) => {
    const popUpHeight = height / 10 * 4 + 30;

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [registerPositionY, setRegisterPositionY] = useState(new Animated.Value(isRegisterOpen ? 0 : popUpHeight));
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // const [errorMessagePosition, setErrorMessagePosition] = useState(new Animated.Value(-50));
    // const [errorMessageOpacity, setErrorMessageOpacity] = useState(new Animated.Value(0));

    const [errorMessageAnimation, seterrorMessageAnimation] = useState({
        position: new Animated.Value(-50),
        opacity: new Animated.Value(0),
    })
    const [timeoutId, setTimeoutId]: any = useState()
    const [signUpError, setSignUpError] = useState<string | null>(null)

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const animatedTransformSignUp = {
        transform: [{translateY: registerPositionY}],
    }

    const animatedTransformErrorMessage = {
        transform: [{translateY: errorMessageAnimation.position}],
        opacity: errorMessageAnimation.opacity,
    }

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                console.log('Keyboard is opened', e.endCoordinates);

                console.log('KeyboardHeight: ', e.endCoordinates.height);

                Animated.timing(registerPositionY, {
                    toValue: - e.endCoordinates.height,
                    duration: 150,
                    useNativeDriver: true,
                    easing: Easing.linear,
                }).start();

                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            (e) => {
                console.log('Keyboard is closed', e.endCoordinates)
                console.log('isRegisterOpen: ', isRegisterOpen);

                if (isRegisterOpen) {
                    Animated.timing(registerPositionY, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                        easing: Easing.linear,
                    }).start();
                }


                setKeyboardVisible(false);
            }
        );
        
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const showErrorMessage = (message: string) => {
        console.log('show errormessage')
        setErrorMessage(message);
        clearTimeout(timeoutId);

        Animated.timing(errorMessageAnimation.position, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
        Animated.timing(errorMessageAnimation.opacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();

        const timeout = setTimeout(() => {
            Animated.timing(errorMessageAnimation.position, {
                toValue: -50,
                duration: 250,
                useNativeDriver: true,
            }).start();
            Animated.timing(errorMessageAnimation.opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }, 2000);

        setTimeoutId(timeout)
    }

    const toggleSignUpForm = () => {

        // setIsRegisterOpen(isRegisterOpen ? false : true);
        
        Animated.timing(registerPositionY, {
            toValue: isRegisterOpen ? popUpHeight : 0,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
        }).start();       
    }
        
    const isUserEqual = (googleUser: any, firebaseUser: any) => {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID && providerData[i].uid === googleUser.user.id) {
                    // We don't need to reauth the Firebase connection.
                    return true;
                }
            }
        }
        return false;
    }
    
    const onSignIn = async (googleUser: any) => {
        // console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser: any) => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!isUserEqual(googleUser, firebaseUser)) {
                // Build Firebase credential with the Google ID token.
                var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.idToken,
                    googleUser.accessToken
                );

                // Sign in with credential from the Google user.
                await firebase.auth().signInWithCredential(credential)
                    .then((result: any) => {
                        if (result.additionalUserInfo.isNewUser) {
                            firebase
                                .database()
                                .ref('/users/' + result.user?.uid)
                                .set({
                                    gmail: result.user?.email,
                                    profile_picture: result.additionalUserInfo?.profile?.picture,
                                    locale: result.additionalUserInfo?.profile?.locale,
                                    first_name: result.additionalUserInfo?.profile?.given_name,
                                    last_name: result.additionalUserInfo?.profile?.family_name,
                                    created_at: Date.now(),
                                })
                                .then((snapshot: any) => {
                                    console.info('User written to database')
                                    // console.log(snapshot);
                                })
                        } else {
                            firebase
                                .database()
                                .ref('/users/' + result.user?.uid)
                                .update({
                                    last_logged_in: Date.now(),
                                })
                        }

                        console.log('writing to database')
                        console.log('User signed in');

                        navigation.navigate('Home');
                    })
                    .catch((error) => {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // The email of the user's account used.
                        var email = error.email;
                        // The firebase.auth.AuthCredential type that was used.
                        var credential = error.credential;
                        // ...
                    });
            } else {
                console.log('User already signed-in Firebase.');
                navigation.navigate('Home');
            }
        });
    }

    const signInWithGoogleAsync = async () => {
        try {
            const result = await Google.logInAsync({
                // behavior: 'web',
                androidClientId: '685615078611-8eqil84kc8763ufdo68vs2ojkdsa86lv.apps.googleusercontent.com',
                iosClientId: '685615078611-nb6s3ti064b210qb1c5jgf6ti36e3vp0.apps.googleusercontent.comz',
                scopes: ['profile', 'email'],
            });

            if (result.type === 'success') {
                onSignIn(result);
                return result.accessToken;
            } else {
                return { cancelled: true };
            }
        } catch (e) {
            return { error: true };
        }
    }

    const signUpWithEmailAndPassword = async (email: string, password: string) => {
        console.log('Signing up with email and password');
        
        firebase.auth().createUserWithEmailAndPassword('felix.vandemaele@skynet.com', 'test123')
            .then((userCredential) => {
                // Signed in 
                var user = userCredential.user;
                console.log('User test: ', user);
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;

                if (errorCode == 'auth/email-already-in-use') {
                    // console.log('User with this email already exists, 😉')
                    showErrorMessage('Email address has already been used!');
                }
            });
    }

    const signInWithEmailAndPassword = async () => {
        console.log('Signing in with email and password.');

        var user = firebase.auth().currentUser;
        if (user) {
        // User is signed in.
            if (user != null) {
                const userData = {
                    name: user.displayName,
                    email: user.email,
                    photoUrl: user.photoURL,
                    emailVerified: user.emailVerified,
                    uid: user.uid,  
                }

                console.log(userData);
                // The user's ID, unique to the Firebase project. Do NOT use
                // this value to authenticate with your backend server, if
                // you have one. Use User.getToken() instead.
            }
        } else {
        // No user is signed in.
        }

    }

    return (
        <SafeAreaView>
            
            
            <LinearGradient
                colors={[theme[700], theme[800]]}
            >
                <Animated.View
                    style={[login.errorMessage, animatedTransformErrorMessage]}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            color: 'red',
                            fontSize: 16,
                        }}
                    >{errorMessage}</Text>
                </Animated.View>

                <View
                    style={[login.logoContainer]}
                >
                    <Svg style={[login.logoImg]} viewBox="0 0 78 78">
                        <G data-name="Add Button">
                            <Path
                                data-name="Exclusion 1"
                                d="M38.998 68.998a30.008 30.008 0 01-11.677-57.642A30.007 30.007 0 0150.675 66.64a29.813 29.813 0 01-11.677 2.358zm0-45a15 15 0 1015 15 15.017 15.017 0 00-15-15z"
                                fill="#fff"
                            />
                        </G>
                    </Svg>

                    <Text style={[login.logoText]} >HUMMIT</Text>
                </View>

                <View 
                    style={[login.buttonsContainer]}
                >
                    <TouchableOpacity
                        style={[login.signInButton]}
                        onPress={() => {signInWithEmailAndPassword()}}
                    >
                        <Text style={[login.signInButtonText]}>SIGN IN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[login.signInButton]}
                        onPress={() => {
                            console.log('isRegisterOpen2: ', isRegisterOpen);
                            setIsRegisterOpen(true);
                            toggleSignUpForm();
                        }}
                    >
                        <Text style={[login.signInButtonText]}>SIGN UP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[login.signInWithGoogleButton]}
                        onPress={() => {
                            console.log('Sign In With Google');
                            signInWithGoogleAsync();
                            navigation.navigate('Home');
                        }}
                    >
                        <Svg style={{
                            width: 25,
                            height: 25,
                        }} 
                        viewBox="0 0 141.137 144.005">
                            <Path
                                data-name="Path 17"
                                d="M7.667 104.335a71.994 71.994 0 010-64.66h.006A72 72 0 0172.001.008a69.182 69.182 0 0148.171 18.75L99.616 39.3a39.094 39.094 0 00-27.62-10.8c-18.779 0-34.719 12.66-40.42 29.721a43.142 43.142 0 000 27.56c5.7 17.059 21.641 29.72 40.42 29.72 9.73 0 18.05-2.5 24.511-6.88v-.01a33.329 33.329 0 0014.379-21.881h-38.89V59h67.9a85.912 85.912 0 011.24 14.64c0 21.91-7.83 40.44-21.42 52.97h-.013l.013.01c-11.93 11-28.291 17.38-47.721 17.38a72 72 0 01-64.328-39.665z"
                                fill="#fff"
                            />
                        </Svg>
                        <Text style={[login.signInWithGoogleButtonText]}>SIGN IN WITH GOOGLE</Text>
                    </TouchableOpacity>
                </View>


            </LinearGradient>

            <Animated.View
                style={[login.registerForm, animatedTransformSignUp]}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        setIsRegisterOpen(false);
                        toggleSignUpForm();
                        console.log('isRegisterOpen2: ', isRegisterOpen);
                    }}
                    style={[login.closeRegisterButton]}
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
                
                <TextInput
                    placeholder="EMAIL"
                    style={[login.registerFormField]}
                />

                <TextInput
                    secureTextEntry={true}
                    placeholder="PASSWORD"
                    style={[login.registerFormField]}
                />

                <LinearGradient
                    colors={[theme[700], theme[800]]}
                    style={[login.signInButton]}
                >
                    <TouchableOpacity
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            signUpWithEmailAndPassword('test', 'test');
                        }}
                    >
                        <Text>SIGN UP</Text>
                    </TouchableOpacity>
                </LinearGradient>

            </Animated.View>
            {/* ------------------------------------- Sign In Pop-Up ---------------------------------------------- */}
            <Animated.View
                style={[login.registerForm, animatedTransformSignUp]}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        setIsRegisterOpen(false);
                        toggleSignUpForm();
                        console.log('isRegisterOpen2: ', isRegisterOpen);
                    }}
                    style={[login.closeRegisterButton]}
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
                
                <TextInput
                    placeholder="EMAIL"
                    style={[login.registerFormField]}
                />

                <TextInput
                    secureTextEntry={true}
                    placeholder="PASSWORD"
                    style={[login.registerFormField]}
                />

                <LinearGradient
                    colors={[theme[700], theme[800]]}
                    style={[login.signInButton]}
                >
                    <TouchableOpacity
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            signUpWithEmailAndPassword('test', 'test');
                        }}
                    >
                        <Text>SIGN UP</Text>
                    </TouchableOpacity>
                </LinearGradient>

            </Animated.View>
        </SafeAreaView>
    )
}

export default Login;