import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';

import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get("window");

export const post = StyleSheet.create({
    container: {
        backgroundColor: theme[100],
        elevation: 3,
        
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,


        borderRadius: 15,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 16,
    },
    profilePic: {
        width: 40,
        height: 40,
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
    commentButton: {
        flexDirection: 'row',
        width: '100%',
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentButtonIcon: {
        marginRight: 8,
        marginLeft: -16,
        width: 24,
        height: 24,
    },

    
})