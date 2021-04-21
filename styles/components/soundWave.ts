import { Dimensions, StyleSheet } from 'react-native';
import { theme } from '../colors/theme';

export const soundWave = StyleSheet.create({
    soundWave: {
        minWidth: 150,
        maxWidth: '80%',
        height: 50,
        borderRadius: 25,
        backgroundColor: theme[800],
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    wave: {
        height: '100%',
        width: '60%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    waveLine: {
        width: 2,
        borderRadius: 50,
        backgroundColor: 'white',
    },
    soundwaveButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    button: {

    },
    time: {
        color: theme[100],
        fontWeight: 'bold',
    },
    commentButton: {},
})