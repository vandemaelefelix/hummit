import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';

export const soundWave = StyleSheet.create({
    soundWave: {
        width: '80%',
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
        width: '70%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    waveLine: {
        width: 3,
        borderRadius: 50,
        backgroundColor: 'white',
    },
    soundwaveButtons: {
        width: '30%',
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