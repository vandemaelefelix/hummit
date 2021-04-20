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
import { login } from '../styles/components/login';
import { firebaseConfig } from '../config';

const { height, width } = Dimensions.get("window");

const Login = ({ navigation } : any) => {
    // ----- State popup forms -----
    const signInFormHeight = height / 10 * 4 + 30;
    const signUpFormHeight = height / 10 * 6 + 30;

    const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);

    const [signInFormAnimation, setSignInFormAnimation] = useState({
        positionY: new Animated.Value(isSignInOpen ? 0 : signInFormHeight)
    });

    const [signUpFormAnimation, setSignUpFormAnimation] = useState({
        positionY: new Animated.Value(isSignUpOpen ? 0 : signUpFormHeight)
    });

    const animatedTransformSignIn = {
        transform: [{translateY: signInFormAnimation.positionY}],
    }    
    const animatedTransformSignUp = {
        transform: [{translateY: signUpFormAnimation.positionY}],
    }    

    // ----- State error message -----
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [errorMessageAnimation, setErrorMessageAnimation] = useState({
        position: new Animated.Value(-50),
        opacity: new Animated.Value(0),
    });
    const [timeoutId, setTimeoutId]: any = useState();

    const animatedTransformErrorMessage = {
        transform: [{translateY: errorMessageAnimation.position}],
        opacity: errorMessageAnimation.opacity,
    }

    // Formfields - Sign In
    const [signInFormEmail, setSignInFormEmail] = useState<string>('');
    const [signInFormPassword, setSignInFormPassword] = useState<string>('');

    // Formfields - Sign Up
    const [signUpFormFirstName, setSignUpFormFirstName] = useState<string>('');
    const [signUpFormName, setSignUpFormName] = useState<string>('');
    const [signUpFormEmail, setSignUpFormEmail] = useState<string>('');
    const [signUpFormPassword, setSignUpFormPassword] = useState<string>('');


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setIsSignInOpen(state => {
                    if (state) {
                        Animated.timing(signInFormAnimation.positionY, {
                            toValue: - e.endCoordinates.height,
                            duration: 150,
                            useNativeDriver: true,
                            easing: Easing.linear,
                        }).start();
                    }

                    return state;
                });

                setIsSignUpOpen((state: boolean) => {
                    if (state) {
                        Animated.timing(signUpFormAnimation.positionY, {
                            toValue: - e.endCoordinates.height,
                            duration: 150,
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

                setIsSignInOpen(state => {
                    if (state) {
                        Animated.timing(signInFormAnimation.positionY, {
                            toValue: 0,
                            duration: 150,
                            useNativeDriver: true,
                            easing: Easing.linear,
                        }).start();
                    }

                    return state;
                });

                setIsSignUpOpen((state: boolean) => {
                    if (state) {
                        Animated.timing(signUpFormAnimation.positionY, {
                            toValue: 0,
                            duration: 150,
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

    const showErrorMessage = (message: string, time: number = 2000) => {
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
        }, time);

        setTimeoutId(timeout)
    }

    const toggleSignInForm = () => {
        setIsSignInOpen((state: boolean) => {
            Animated.timing(signInFormAnimation.positionY, {
                toValue: state ? signInFormHeight : 0,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.quad),
            }).start();

            setIsSignInOpen(state ? false : true);
            return state;
        });
    }
    
    const toggleSignUpForm = () => {
        setIsSignUpOpen((state) => {
            Animated.timing(signUpFormAnimation.positionY, {
                toValue: state ? signUpFormHeight : 0,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.quad),
            }).start();

            setIsSignUpOpen(state ? false : true);
            return state;
        });
    }
    
    // ----- Sign in stuff firebase -----
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

                            firebase.firestore().collection('users').doc(result.user?.uid)
                                .set({
                                    email: result.user?.email,
                                    profile_picture: result.additionalUserInfo?.profile?.picture,
                                    locale: result.additionalUserInfo?.profile?.locale,
                                    first_name: result.additionalUserInfo?.profile?.given_name,
                                    last_name: result.additionalUserInfo?.profile?.family_name,
                                    friends: [],
                                    created_at: Date.now(),
                                })
                                .then((snapshot: any) => {
                                    console.info('User written to database');
                                })
                        } else {
                            firebase.firestore().collection('users').doc(result.user?.uid)
                                .update({
                                    last_logged_in: Date.now(),
                                });

                            // firebase
                            //     .database()
                            //     .ref('/users/' + result.user?.uid)
                            //     .update({
                            //         last_logged_in: Date.now(),
                            //     })
                        }

                        console.log('writing to database')
                        console.log('User signed in');

                        navigation.navigate('Home');
                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;

                        showErrorMessage('Something went wrong 😳');
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

    const signUpWithEmailAndPassword = async (firstName: string, name: string,email: string, password: string) => {
        console.log('Signing up with email and password');
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                var user = userCredential.user;

                firebase.firestore().collection('users').doc(user?.uid)
                    .set({
                        email: email,
                        first_name: firstName,
                        last_name: name,
                        created_at: Date.now(),
                        friends: [],
                    })
                    .then((snapshot: any) => {
                        console.info('User written to database')
                        navigation.navigate('Home');
                    })

            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;

                if (errorCode == 'auth/email-already-in-use') {
                    showErrorMessage('Email address has already been used!');
                }
            });
    }

    const signInWithEmailAndPasswordCustom = async (email: string, password: string) => {

        if (email === '' || email.length <= 3) {
            showErrorMessage('Please fill in your email address.');
            return;
        } else if (password === '' || password.length <= 4) {
            showErrorMessage('Password needs to be at least 5 characters long!');
            return;
        }

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((user) => {
                firebase.firestore().collection('users').doc(user?.user?.uid)
                    .update({
                        last_logged_in: Date.now(),
                    });
                navigation.navigate('Home');
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;

                switch (errorCode) {
                    case 'auth/invalid-email':
                        showErrorMessage('Invalid email address!');
                        break;
                    case 'auth/user-disabled':
                        showErrorMessage('User has been disabled.');
                        break;
                    case 'auth/user-not-found':
                        showErrorMessage('Wrong email or password!');
                        break;
                    case 'auth/wrong-password':
                        showErrorMessage('Wrong email or password!');                    
                        break;
                
                    default:
                        showErrorMessage(errorMessage, 5000);
                        break;
                }
            });

    }

    return (
        <SafeAreaView>
            
            
            <LinearGradient
                colors={[theme[700], theme[800]]}
            >
                {/* ---------- ERROR MESSAGE ---------- */}
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
                

                {/* ---------- LOGO ---------- */}
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


                {/* ---------- BUTTONS: SIGN IN | SIGN UP | SIGN IN WITH GOOGLE ---------- */}
                <View 
                    style={[login.buttonsContainer]}
                >
                    <TouchableOpacity
                        style={[login.button]}
                        onPress={() => {
                            toggleSignInForm()
                        }}
                    >
                        <Text style={[login.buttonText]}>SIGN IN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[login.button]}
                        onPress={() => {
                            toggleSignUpForm();
                        }}
                    >
                        <Text style={[login.buttonText]}>SIGN UP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{...login.button, ...login.signInWithGoogleButton}}
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

            
            {/* ---------- SIGN UP FORM ---------- */}
            <Animated.View
                style={[login.form, login.signUpForm, animatedTransformSignUp]}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        toggleSignUpForm();
                    }}
                    style={[login.closeFormButton]}
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
                    placeholder="FIRSTNAME"
                    style={[login.formField]}
                    onChangeText={(value) => {
                        setSignUpFormFirstName(value);
                    }}
                />
                <TextInput
                    placeholder="NAME"
                    style={[login.formField]}
                    onChangeText={(value) => {
                        setSignUpFormName(value);
                    }}
                />
                <TextInput
                    placeholder="EMAIL"
                    style={[login.formField]}
                    onChangeText={(value) => {
                        setSignUpFormEmail(value);
                    }}
                />

                <TextInput
                    secureTextEntry={true}
                    placeholder="PASSWORD"
                    style={[login.formField]}
                    onChangeText={(value) => {
                        setSignUpFormPassword(value);
                    }}
                />

                <LinearGradient
                    colors={[theme[700], theme[800]]}
                    style={[login.formButton]}
                >
                    <TouchableOpacity
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            signUpWithEmailAndPassword(signUpFormFirstName, signUpFormName, signUpFormEmail, signUpFormPassword);
                        }}
                    >
                        <Text style={[login.formButtonText]}>SIGN UP</Text>
                    </TouchableOpacity>
                </LinearGradient>

            </Animated.View>

            {/* ---------- SIGN IN FORM ---------- */}
            <Animated.View
                style={[login.form, login.signInForm, animatedTransformSignIn]}
            >
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        toggleSignInForm();
                    }}
                    style={[login.closeFormButton]}
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
                    style={[login.formField]}
                    onChangeText={(value) => {
                        setSignInFormEmail(value);
                    }}
                />

                <TextInput
                    secureTextEntry={true}
                    placeholder="PASSWORD"
                    style={[login.formField]}
                    onChangeText={(value) => {
                        setSignInFormPassword(value);
                    }}
                />

                <LinearGradient
                    colors={[theme[700], theme[800]]}
                    style={[login.formButton]}
                >
                    <TouchableOpacity
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            signInWithEmailAndPasswordCustom(signInFormEmail, signInFormPassword);
                        }}
                    >
                        <Text style={[login.formButtonText]}>SIGN IN</Text>
                    </TouchableOpacity>
                </LinearGradient>

            </Animated.View>
        
        </SafeAreaView>
    )
}

export default Login;