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
    button: {
        width: '70%',
        height: (height/3) / 5,
        borderColor: theme[100],
        borderWidth: 2,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: theme[100],
    },

    // signInButton: {
    //     width: '70%',
    //     height: (height/3) / 5,
    //     borderColor: theme[100],
    //     borderWidth: 2,
    //     borderRadius: 50,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     marginBottom: 20,
    // },
    // signInButtonText: {
    //     fontWeight: 'bold',
    //     fontSize: 16,
    //     color: theme[100],
    // },
    signInWithGoogleButton: {
        justifyContent: 'space-evenly',
        flexDirection: 'row',
    },
    signInWithGoogleButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: theme[100],
        flexGrow: 0.1,
    },

    form: {
        position: 'absolute',
        width: '100%',
        // height: height / 10 * 5,
        bottom: 0,
        backgroundColor: theme[100],
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    signInForm: {
       height: height / 10 * 4, 
    },
    signUpForm: {
       height: height / 10 * 6, 
    },
    formField: {
        width: '70%',
        // height: 60,
        height: (height/3) / 5,
        borderColor: theme[800],
        borderWidth: 2,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        textAlign: 'center',
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
        width: '70%',
        height: (height/3) / 5,
        borderColor: theme[100],
        borderWidth: 2,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    formButtonText: {
        color: theme[100],
        fontWeight: 'bold',
        fontSize: 18,
    },

    errorMessage: {
        position: 'absolute',
        top: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 50,
        padding: 8,
        width: '80%',
        alignSelf: 'center',
        backgroundColor: theme[100],
        borderRadius: 10,
        elevation: 5,
        transform: [{translateY: -80}],
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
    formFieldContainer: {
        width: '70%',
        height: (height/3) / 4,
        justifyContent: 'center',
    },

    label: {
        fontWeight: '700',
    },
})