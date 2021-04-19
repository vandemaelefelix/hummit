import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';

export const post = StyleSheet.create({
    container: {
        backgroundColor: theme[600],
        elevation: 3,
        borderRadius: 15,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 16,
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 100,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    titleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    description: {
        marginBottom: 16,
    },
    commentButton: {},
})