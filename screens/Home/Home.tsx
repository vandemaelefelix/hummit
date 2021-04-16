import React, { useEffect } from 'react';

import { Button, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firebase from 'firebase';

const Home = ({ navigation } : any) => {
    useEffect(() => {
        checkIfLoggedIn()
    }, [])

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // console.log(user);
            } else {
                navigation.navigate('Login', { error: 'not logged in' })
            }
        })
    }    

    return (
        <SafeAreaView>
            <TouchableOpacity onPress={() => {navigation.navigate('Login')}}><Text>Home</Text></TouchableOpacity>
            <Button
                title="Sign out"
                onPress={() => {firebase.auth().signOut()}}
            />
        </SafeAreaView>
    )
}

export default Home;