import React, {useState, useEffect} from 'react';

import { Button, FlatList, Text, TouchableOpacity, View, Image } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';


import { theme } from '../styles/colors/theme';
import { header } from '../styles/components/header';

import firebase from 'firebase';
import 'firebase/firestore';

const Header = (props: any) => {
    const { showProfilePicture, userId, isProfilePage } = props;
    const [currentUser, setCurrentUser] = useState<firebase.firestore.DocumentData | undefined>();
    const [profilePicture, setProfilePicture] = useState();

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                getProfileData(user.uid);
            }
        })
    }


    useEffect(() => {
        checkIfLoggedIn()
    }, []);

    const getProfileData = async (user_id: string) => {
        await firebase.firestore()
            .collection('users')
            .doc(user_id).get()
            .then((doc) => {
                setCurrentUser(doc.data());
            }).catch((error) => {
                console.error("Error getting profile data:", error);
            });
    }

    return (

        isProfilePage ?

        <View style={[header.container, {justifyContent: 'center'}]}>
            <Text style={{...header.logo}}>{currentUser?.first_name} {currentUser?.last_name}</Text>
        </View>

        :

        <View style={header.container}>
            <TouchableOpacity style={[header.menu]}
                onPress={() => {

                }}
            >
                {
                    showProfilePicture ?

                    <Image
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 50,
                        }}
                        source={currentUser ? {uri: currentUser.profile_picture} : require('../assets/profile_empty.png')}
                    >
                    </Image> 

                    : 

                    <></>
                }

            </TouchableOpacity>

            <Text style={{...header.logo}}>HUMMIT</Text>

            <TouchableOpacity 
                style={[header.search]}
                onPress={() => {

                }}
            >
                <Svg style={{width: '90%', height: '90%'}} viewBox="0 0 25.067 25.054">
                    <G data-name="Search Icon" fill="none" stroke="#000" strokeWidth={3}>
                        <G data-name="Ellipse 1">
                            <Circle cx={10.75} cy={10.75} r={10.75} stroke="none" />
                            <Circle cx={10.75} cy={10.75} r={9.25} />
                        </G>
                        <Path data-name="Line 6" d="M17.422 17.344L24 24" />
                    </G>
                </Svg>
            </TouchableOpacity>
        </View>
    );
}

export default Header;