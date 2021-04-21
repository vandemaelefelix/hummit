import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';

import * as firebase from 'firebase';
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
import Loading from './screens/Loading';
import index from './screens/Home/index';

const Stack = createStackNavigator();

export default function App( {navigation}: any ) {
	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<Stack.Navigator 
					headerMode='none'
					initialRouteName='Home'
				>
					<Stack.Screen component={index} name='Home'></Stack.Screen>
					<Stack.Screen component={Login} name='Login'></Stack.Screen>
					<Stack.Screen component={Register} name='Register'></Stack.Screen>
					<Stack.Screen component={Loading} name='Loading'></Stack.Screen>
				</Stack.Navigator>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
