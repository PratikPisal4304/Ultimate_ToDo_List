// app/components/GamificationHeader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ProgressBar } from 'react-native-paper';

const GamificationHeader = ({ userData }) => {
    const theme = useTheme();
    const level = userData?.level || 1;
    const points = userData?.points || 0;
    const pointsForNextLevel = level * 100;
    const pointsInCurrentLevel = points - ((level - 1) * 100);
    const progress = pointsInCurrentLevel / 100;

    return (
        <View style={[styles.gamificationBar, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statBlock}>
                <Text style={styles.statValue}>LVL {level}</Text>
                <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
                <Text style={styles.statLabel}>{pointsInCurrentLevel} / 100 PTS</Text>
            </View>
            <View style={styles.statBlock}>
                <Text style={styles.statValue}>🔥 {userData?.streak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    gamificationBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        marginTop: 8
    },
    statBlock: {
        alignItems: 'center',
        flex: 1
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    statLabel: {
        fontSize: 12,
        color: '#A9A9A9',
        marginTop: 4
    },
    progressBar: {
        width: '80%',
        marginTop: 8,
        height: 6,
        borderRadius: 3
    },
});

export default GamificationHeader;