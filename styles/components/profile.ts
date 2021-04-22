import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';

import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get("window");

export const profile = StyleSheet.create({
    header: {
        width: '100%',
        alignItems: 'center',
        zIndex: 20,
        position: 'absolute', 
        top: 0, 
        left: 0,
        height: height / 10 * 4,
        // backgroundColor: 'rgba(255, 0, 255, 0.5)',
    },
    headerContent: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        zIndex: 10,
        // marginTop: 30,
        justifyContent: 'space-evenly',
        // backgroundColor: 'rgba(255, 0, 0, 0.5)',
    },
    headerBackground: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: width * 0.5450684285040113,
        resizeMode: 'contain',
    },
    profilePictureContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%',
        // !==========================
        height: '45%',
        aspectRatio: 1,
        marginTop: '5%',
        // backgroundColor: 'orange',
        // zIndex: 10,
    },
    profilePicture: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
        // elevation: 5,
    },
    editProfilePicture: {
        borderRadius: 100,
        width: '20%',
        height: '20%',
        position: 'absolute',
        bottom: '5%',
        right: '5%',
        backgroundColor: theme[800],
        zIndex: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        marginBottom: '-5%',
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme[100],
        textAlign: 'center',
    },
    info: {
        width: '100%',
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor: 'yellow'
    },
    infoText: {
        color: theme[100],
        fontSize: 16,
    },
    infoNumber: {
        color: theme[100],
        fontSize: 20,
        fontWeight: 'bold',
        
    },
    friends: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    points: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
})