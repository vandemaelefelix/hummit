import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get("window");

export const search = StyleSheet.create({
    container: {
        marginTop: 46 + 60,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noCommentsText: {
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 16,
    },
    searchResultContainer: {
        width: width / 10 * 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    userName: {
        fontSize: 18,
        lineHeight: 18,
    },
    userProfilePic: {
        width: 32,
        height: 32,
        borderRadius: 50,
        marginRight: 16,
    },
    searchSection: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        backgroundColor: theme[100],
        alignItems: 'center',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: height / 10 * 9,
        elevation: 10,
        zIndex: 1000,
    },
    searchInputField: {
        width: '100%',
        backgroundColor: '#F3F3F3',
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    searchInputContainer: {
        height: 60,
        width: '100%',
        position: 'absolute',
        top: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    closeSearchButton: {
        width: 60,
        height: 60,
        borderRadius: 50,
        position: 'absolute',
        top: -30,
        backgroundColor: theme[100],
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        zIndex: 1,
    },
    commentTextContainer: {
        width: '100%',
        backgroundColor: '#F3F3F3',
        borderRadius: 15,
        padding: 12,
    },
    commentName: {
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 16,
    },
    sendSearchButton: {
        position: 'absolute',
        right: 5,
        aspectRatio: 1.5,
        borderRadius: 50,
        height: '80%',
        alignSelf: 'center',
        backgroundColor: theme[100] ,
        alignItems: 'center',
        justifyContent: 'center',
    },

});