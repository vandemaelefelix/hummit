import React, {useState, useEffect} from 'react';

import { Button, FlatList, Text, TouchableOpacity, View, Image } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

import Svg, { Path, G, Circle } from 'react-native-svg';

import { theme } from '../styles/colors/theme';
import { soundWave } from '../styles/components/soundWave';

const SoundWave = (props: any) => {
    const { postId, memo, duration } = props;

    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(duration);
    const [isPaused, setIsPaused] = useState(false);
    const [shouldPause, setShouldPause] = useState(false);

    


    function getRndInteger(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    function randRangeSeed(min: number, max: number, seed: number) {
        var x = Math.sin(seed) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min) + min);
    }

    const convertMillisToMinSec = (millis: number | undefined) => {
        if (!!millis) {
            const dateObject = new Date(millis)
            const min = dateObject.getMinutes().toString();
            const sec = dateObject.getSeconds().toString();
            return `${min.length <= 1 ? "0"+min : min}:${sec.length <=1 ? "0" + sec : sec}`;
        } else {
            return duration;
        }
    }

    const createSoundWaves = (id: string) => {
        let jsxObject = [];
        let seed = postId+15;
        for (let i = 0; i < 30 ; i++) {
            jsxObject.push(<View key={id + i.toString()} style={{...soundWave.waveLine, height: randRangeSeed(5, 25, seed++)}}></View>);
        }

        return jsxObject;
    }

    const playSound = async () => {
        const {sound, status} = await Audio.Sound.createAsync(memo);
  
        // @ts-ignore
        const totalTime = status.durationMillis;
        
        sound?.setStatusAsync({ progressUpdateIntervalMillis: 100 })
        
        sound?.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
            if (status.isLoaded) {
                const currentTime = status?.positionMillis;
                setPlaybackTime(convertMillisToMinSec(totalTime - currentTime));
                
                if (status.didJustFinish) {
                    setIsPlaying(false);
                }
                
                if (!isPaused && shouldPause) {
                    sound.pauseAsync()
                }
            }
        });
  
        await sound.playAsync();
        // await sound.unloadAsync();
    }

    return (
        <LinearGradient colors={[theme[800], theme[700]]} style={[soundWave.soundWave]}>
            {/* <View style={[soundWave.soundwaveButtons]}>
            </View> */}
            {
                !isPlaying ? 
                <TouchableOpacity 
                    style={[soundWave.button]}
                    onPress={() => {setIsPlaying(true); playSound()}}
                >
                    <Svg width={24} height={24} viewBox="0 0 24 24">
                        <G data-name="Group 14" transform="translate(-8 -8)">
                            <Circle
                                data-name="Ellipse 6"
                                cx={12}
                                cy={12}
                                r={12}
                                transform="translate(8 8)"
                                fill="#fff"
                            />
                            <Path
                                data-name="Polygon 7"
                                d="M25.891 18.856a1 1 0 010 1.756l-7.912 4.315a1 1 0 01-1.479-.878v-8.63a1 1 0 011.479-.878z"
                                fill="#7100fd"
                            />
                        </G>
                    </Svg>
                </TouchableOpacity>
                :
                <TouchableOpacity 
                    style={[soundWave.button]}
                    onPress={() => {setIsPlaying(false); playSound()}}
                >
                    <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
                        <G transform="translate(-8 -8)">
                            <Circle
                                data-name="Ellipse 6"
                                cx={12}
                                cy={12}
                                r={12}
                                transform="translate(8 8)"
                                fill="#fff"
                            />
                            <Path
                                data-name="Line 42"
                                fill="none"
                                stroke="#7301fc"
                                strokeLinecap="round"
                                strokeWidth={3}
                                d="M16.5 16v8"
                            />
                            <Path
                                data-name="Line 43"
                                fill="none"
                                stroke="#7301fc"
                                strokeLinecap="round"
                                strokeWidth={3}
                                d="M23.5 16v8"
                            />
                        </G>
                    </Svg>
                </TouchableOpacity>
            }
            
            <Text style={[soundWave.time]}>{playbackTime}</Text>
            <View style={[soundWave.wave]}>
                {/* <TouchableOpacity onPress={() => {createSoundWave()}}><Text>test</Text></TouchableOpacity> */}
                {createSoundWaves(postId.toString())}
            </View>
        </LinearGradient>
    );
}

export default SoundWave;