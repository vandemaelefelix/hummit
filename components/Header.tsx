import React, {useState, useEffect} from 'react';

import { Button, FlatList, Text, TouchableOpacity, View, Image } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';


import { theme } from '../styles/colors/theme';
import { header } from '../styles/components/header';

const Header = (props: any) => {
    

    return (
        <View style={header.container}>
            <TouchableOpacity style={[header.menu]}>
                <Svg viewBox="0 0 24 19">
                    <G data-name="Menu Icon" fill="none" stroke="#000" strokeWidth={3}>
                        <Path data-name="Line 3" d="M0 1.5h24" />
                        <Path data-name="Line 4" d="M0 9.5h12" />
                        <Path data-name="Line 5" d="M0 17.5h18" />
                    </G>
                </Svg>
            </TouchableOpacity>

            <Text style={{...header.logo}}>HUMMIT</Text>

            <TouchableOpacity style={[header.search]}>
                <Svg viewBox="0 0 25.067 25.054">
                    <G data-name="Search Icon" fill="none" stroke="#000" strokeWidth={3}>
                        <G data-name="Ellipse 1">
                            <Circle cx={10.75} cy={10.75} r={10.75} stroke="none" />
                            <Circle cx={10.75} cy={10.75} r={9.25} />
                        </G>
                        <Path data-name="Line 6" d="M17.422 17.344L24 24" />
                    </G>
                </Svg>
            </TouchableOpacity>
        </View>
    );
}

export default Header;