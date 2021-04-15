import React from 'react';

import { Button, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';

const Login = ({ navigation } : any) => {

    const isUserEqual = (googleUser: any, firebaseUser: any) => {
        if (firebaseUser) {
          var providerData = firebaseUser.providerData;
          for (var i = 0; i < providerData.length; i++) {

            console.info('Test 1: ', providerData[i].providerId)
            console.info('Test 2: ', firebase.auth.GoogleAuthProvider.PROVIDER_ID)
            console.info('Test 3: ', providerData[i].uid)
            console.info('Test 4: ', googleUser.user.id)
            // if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID && providerData[i].uid === googleUser.getBasicProfile().getId()) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID && providerData[i].uid === googleUser.user.id) {
              // We don't need to reauth the Firebase connection.
                return true;
            }
          }
        }
        return false;
    }
    
    const onSignIn = (googleUser: any) => {
        console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser: any) => {
          unsubscribe();
          // Check if we are already signed-in Firebase with the correct user.
          if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(
                googleUser.idToken,
                googleUser.accessToken
            );
      
            // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential)
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
                            navigation.navigate('Home');
                            console.info('User written to database')
                            console.log(snapshot);
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
          }
        });
      }

    const signInWithGoogleAsync = async () => {
        try {
            const result = await Google.logInAsync({
            // behavior: 'web',
            androidClientId: '685615078611-8eqil84kc8763ufdo68vs2ojkdsa86lv.apps.googleusercontent.com',
            iosClientId: 'YOUR_CLIENT_ID_HERE',
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

    return (
        <SafeAreaView>
            <TouchableOpacity onPress={() => {navigation.navigate('Home')}}><Text>Login</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {navigation.navigate('Register')}}><Text>Go to Register</Text></TouchableOpacity>
            <Text>Email</Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={text => console.log(text)}
                placeholder={'Email'}
            />
            <Text>Password</Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={text => console.log(text)}
                placeholder={'Password'}
                secureTextEntry={true}
            />

            <Button
                onPress={() => {console.log('Button Clicked'); navigation.navigate('Loading')}}
                title="Learn More"
                color="#841584"
                accessibilityLabel="Learn more about this purple button"
            />

            <Button 
                title="Sign in with Google"
                onPress={() => {
                    signInWithGoogleAsync()
                }}
            />
        </SafeAreaView>
    )
}

export default Login;