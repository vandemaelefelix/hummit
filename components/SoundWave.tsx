import React, {useState, useEffect} from 'react';

import { Button, FlatList, Text, TouchableOpacity, View, Image } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

import Svg, { Path, G, Circle } from 'react-native-svg';

import { theme } from '../styles/colors/theme';
import { soundWave } from '../styles/components/soundWave';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';

const SoundWave = (props: any) => {

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

    const { postId, memo, duration, metering } = props;

    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState<string>(convertMillisToMinSec(duration));
    const [isPaused, setIsPaused] = useState(false);
    const [shouldPause, setShouldPause] = useState(false);
    const [soundObject, setSoundObject] = useState<Audio.Sound | undefined>(undefined)

    
    

    // ! ====================================================================
    
    const playSound = async (url: string) => {
        try {
            let {sound, status} = await Audio.Sound.createAsync({uri: memo})
            
            sound.setStatusAsync({ progressUpdateIntervalMillis: 100 })
        
            sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
                if (status.isLoaded && status.durationMillis) {
                    const totalTime: number = status.durationMillis;
                    const currentTime: number = status.positionMillis;
                    setPlaybackTime(convertMillisToMinSec((totalTime - currentTime )));
                    
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        setPlaybackTime(convertMillisToMinSec(duration));
                    }
                }
            });

            sound.playAsync();
            setSoundObject(sound);
        } catch (e) {
            console.log('ERROR Loading Audio', e);
        }
    }

    // ! ====================================================================

    function getRndInteger(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    function randRangeSeed(min: number, max: number, seed: number) {
        var x = Math.sin(seed) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min) + min);
    }

    const reduceArraySize = (array: Array<number>, outputSize: number): Array<number> => {
        let reducedArray: Array<number> = [];
        // console.log(array.length);
    
        if (array.length > outputSize) {
            let averageNumber = Math.floor(array.length / outputSize);
            
            for (let i = 0; i < outputSize; i++) {
                let average = (arr: any) => arr.reduce((a: any, b: any) => a + b) / arr.length;
                if (i == outputSize - 1) {
                    // reducedArray.push(Math.floor(average(array.slice(i, outputSize))))
                    reducedArray.push(Math.floor(Math.max(...array.slice(i, outputSize))))
                } else {
                    reducedArray.push(Math.floor(average(array.slice(i, i+averageNumber))))
                    // reducedArray.push(Math.floor(Math.max(...array.slice(i, i+averageNumber))))
                }
            }
        } else {
            // console.log(Math.floor(outputSize / array.length))
            const rest = outputSize - (array.length * Math.floor(outputSize / array.length));
            let restCount = 0;
            console.log(rest)
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < Math.floor(outputSize / array.length); j++) {
                    reducedArray.push(array[i])
                }
                if (restCount < rest) {
                    reducedArray.push(array[i]);
                    restCount+=1;
                }
            }
    
            // console.log(reducedArray.length)
        }
    
        return reducedArray;
    }

    const createSoundWavesRandom = (id: string) => {
        let jsxObject = [];
        let seed = postId+15;
        for (let i = 0; i < 30 ; i++) {
            jsxObject.push(<View key={id + i.toString()} style={{...soundWave.waveLine, height: randRangeSeed(2, 50, seed++)}}></View>);
            // jsxObject.push(<View key={id + i.toString()} style={{...soundWave.waveLine, height: randRangeSeed(5, 25, seed++)}}></View>);
        }

        return jsxObject;
    }

    const createSoundWavesWithMetering = (array: number[], numWaves: number) => {
        let reducedArray = reduceArraySize(array, numWaves);
        // console.log(convertMillisToMinSec(duration) ,reducedArray)
        // console.log('Minimum: ', Math.min(...reducedArray));
        // console.log('Maximum: ', Math.max(...reducedArray));
        let jsxObject = [];
        let test = [];
        for (let i = 0; i < reducedArray.length; i++) {
            let height = ((reducedArray[i] + 160) / 160) * 20 + 5
            test.push(height)
            jsxObject.push(<View key={i.toString()} style={{...soundWave.waveLine, height: height}}></View>);
        }
        return jsxObject;
    }

    return (
        <LinearGradient colors={[theme[800], theme[700]]} style={[soundWave.soundWave]}>
            {
                !isPlaying ? 
                <TouchableOpacity 
                    style={[soundWave.button]}
                    onPress={() => {

                        if (isPaused && soundObject) {
                            soundObject.playAsync();
                            setIsPaused(false);
                            setIsPlaying(true);
                        } else {
                            playSound(memo)
                            setIsPlaying(true);
                        }
                    }}
                >
                    <Svg width={'100%'} height={'100%'} viewBox="0 0 24 24">
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
                    onPress={() => {
                        setIsPlaying(false);
                        if(soundObject) {
                            soundObject.pauseAsync();
                            setIsPaused(true);
                        }
                    }}
                >
                    <Svg width={'100%'} height={'100%'} viewBox="0 0 24 24" {...props}>
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

            {
                metering ? 
                createSoundWavesWithMetering(metering, 30)
                :
                createSoundWavesRandom(postId)
            }

            </View>
        </LinearGradient>
    );
}

export default SoundWave;