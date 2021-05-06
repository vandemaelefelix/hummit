import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get("window");

export const tabNavBar = StyleSheet.create({
    form: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        backgroundColor: theme[100],
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: height / 10 * 4,
        elevation: 10,
    },
    container: {
        width: '100%',
        alignItems:  'center',
        justifyContent: 'space-around',
        height: '80%',
    },
    textInput: {
        width: '100%',
        minHeight: (height/3) / 7,
        borderColor: theme[800],
        borderBottomWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    formFieldText: {
        color: 'black',
    },
    closeFormButton: {
        width: 60,
        height: 60,
        borderRadius: 50,
        position: 'absolute',
        top: -30,
        backgroundColor: theme[100],
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        zIndex: 1,
    },
    formButton: {
        width: '50%',
        height: (height/3) / 6,
        backgroundColor: theme[800],
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    formButtonText: {
        color: theme[100],
        fontWeight: 'bold',
        fontSize: 18,
    },

    picker: {
        borderColor: theme[800],
        borderWidth: 5,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerContainer: {
        width: '70%',
        height: (height/3) / 5,
        borderBottomWidth: 2,
        borderBottomColor: theme[800],
        justifyContent: 'center',
    },
    formFieldContainer: {
        width: '70%',
        height: (height/3) / 4,
        justifyContent: 'center',
    },

    label: {
        fontWeight: '700',
    },
})