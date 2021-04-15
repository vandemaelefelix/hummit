import React, { useEffect } from 'react';

import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import firebase from 'firebase';

const Loading = ({ navigation } : any) => {
    useEffect(() => {
        checkIfLoggedIn()
    }, [])

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                navigation.navigate('Home')
            } else {
                navigation.navigate('Login')
            }
        })
    }

    return (
        <SafeAreaView style={{justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large"/>
        </SafeAreaView>
    )
}

export default Loading;