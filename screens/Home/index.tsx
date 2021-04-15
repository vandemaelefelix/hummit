import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Home from './Home';
import Profile from './Profile';

const Tab = createBottomTabNavigator();

const index = ({ navigation } : any) => {
    

    return (
        <SafeAreaProvider>
            <Tab.Navigator>
                {/* <Tab.Screen name="Home" component={Home} /> */}
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Profile" component={Profile} />
            </Tab.Navigator>
        </SafeAreaProvider>
    )
}

export default index;