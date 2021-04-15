import React from 'react';

import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Register = ({ navigation } : any) => {
    

    return (
        <SafeAreaView>
            <Text>Register</Text>
            <TouchableOpacity onPress={() => {navigation.navigate('Login')}}><Text>Go to Login</Text></TouchableOpacity>
        </SafeAreaView>
    )
}

export default Register;