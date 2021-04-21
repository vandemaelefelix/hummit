import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';

import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get("window");

export const profile = StyleSheet.create({
    header: {
        width: '100%',
        // height: height / 10 * 4,
        // backgroundColor: 'blue',
        alignItems: 'center',
        overflow: 'hidden',
        // backgroundColor: theme[100],
        // backgroundColor: 'green',
        padding: 0
    },
    headerContent: {
        width: '100%',
        alignItems: 'center',
        zIndex: 10,
        // backgroundColor: 'red',
        // paddingBottom: 32
    },
    headerBackground: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        bottom: -height / 10 * 1,
        zIndex: 1,
    },
    profilePictureContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%',
        aspectRatio: 1,
        overflow: 'hidden',
        marginTop: 30,
        zIndex: 10,
    },
    profilePicture: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
    },
    editProfilePicture: {
        borderRadius: 100,
        width: '25%',
        height: '25%',
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme[800],
        zIndex: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        padding: 16,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme[100],
        textAlign: 'center',
    },
    info: {
        width: '100%',
        // backgroundColor: 'red',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 32,
        paddingBottom: 32
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