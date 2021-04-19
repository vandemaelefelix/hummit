import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';

export const header = StyleSheet.create({
    container: {
        backgroundColor: theme[600],
        // borderBottomColor: 'black',
        // borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    logo: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
    },
    menu: {
        width: 24,
        height: 24,
    },
    search: {
        width: 24,
        height: 24,
    },
    
})