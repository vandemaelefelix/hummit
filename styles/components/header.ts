import { StyleSheet } from 'react-native';
import { theme } from '../colors/theme';

export const header = StyleSheet.create({
    container: {
        backgroundColor: theme[100],
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
        width: 30,
        height: 30,
        borderRadius: 50,
    },
    search: {
        width: 30,
        height: 30,
    },
    
})