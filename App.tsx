import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState, createContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';

// import * as firebase from 'firebase';
import firebase from 'firebase';
import { firebaseConfig } from './config';

//@ts-ignore
if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig)
	// firebase.initializeApp({});
 }else {
	firebase.app(); // if already initialized, use that one
 }

import Login from './screens/Login';
import Register from './screens/Register';
import OtherProfile from './screens/OtherProfile';
import Loading from './screens/Loading';
import index from './screens/Home/index';

const Stack = createStackNavigator();
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']);

export default function App( {navigation}: any ) {

	const isMountedRef = useRef<boolean | null>(null);
	const [initialRouteName, setInitialRouteName] = useState('Login')
    
    useEffect(() => {
        isMountedRef.current = true;

        if (isMountedRef) {
            checkIfLoggedIn();
        }

        return () => {
            isMountedRef.current = false;
        }
    }, []);

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
				setInitialRouteName('Home')
            } else {
                firebase.auth().signOut();
            }
        })
    }

	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<Stack.Navigator 
					headerMode='none'
					initialRouteName={initialRouteName}
				>
					<Stack.Screen component={index} name='Home'></Stack.Screen>
					<Stack.Screen component={Login} name='Login'></Stack.Screen>
					<Stack.Screen component={OtherProfile} name='OtherProfile'></Stack.Screen>
				</Stack.Navigator>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
