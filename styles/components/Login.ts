import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get("window");

export const login = StyleSheet.create({
    buttonsContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 3,
    },
    logoContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        height: (height / 3) * 2,
    },
    logoImg: {
        width: 150,
        height: 150,
    },
    logoText: {
        fontWeight: 'bold',
        fontSize: 32,
        color: theme[100],
    },
    signInButton: {
        width: '70%',
        height: (height/3) / 5,
        borderColor: theme[100],
        borderWidth: 2,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    signInButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: theme[100],
    },
    signInWithGoogleButton: {
        width: '70%',
        height: (height/3) / 5,
        borderColor: theme[100],
        borderWidth: 2,
        borderRadius: 50,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    signInWithGoogleButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: theme[100],
        flexGrow: 0.1,
    },
    registerForm: {
        position: 'absolute',
        width: '100%',
        height: height / 10 * 4,
        bottom: 0,
        backgroundColor: theme[100],
        justifyContent: 'center',
        alignItems: 'center',
        // borderTopRadius: 30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    registerFormField: {
        width: '70%',
        height: 60,
        borderColor: theme[800],
        borderWidth: 2,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        textAlign: 'center',
    },
    closeRegisterButton: {
        width: 60,
        height: 60,
        borderRadius: 50,
        position: 'absolute',
        top: -30,
        backgroundColor: theme[100],
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    }, 
    errorMessage: {
        position: 'absolute',
        top: 20,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: '80%',
        alignSelf: 'center',
        backgroundColor: theme[100],
        borderRadius: 10,
        elevation: 5,
        transform: [{translateY: -80}],
    }

})