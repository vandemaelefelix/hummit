import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get("window");

export const comments = StyleSheet.create({
    container: {
        marginTop: 46 + 40,
        width: '100%',
    },
    commentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 16,
    },
    commentText: {

    },
    commentProfilePic: {
        width: 32,
        height: 32,
        borderRadius: 50,
        marginTop: 12,
    },
    commentSection: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        backgroundColor: theme[100],
        alignItems: 'center',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: height / 10 * 5,
        // height: Dimensions.get('screen').height,
        elevation: 10,
        zIndex: 1000,
    },
    commentInputField: {
        width: '100%',
        backgroundColor: '#F3F3F3',
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    commentInputContainer: {
        height: 60,
        width: '100%',
        position: 'absolute',
        top: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    closeCommentsButton: {
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
    commentTextContainer: {
        width: '80%',
        backgroundColor: '#F3F3F3',
        borderRadius: 15,
        padding: 12,
    },
    commentName: {
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 16,
    },

});