// app/components/GamificationHeader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ProgressBar } from 'react-native-paper';
import useUserData from '../hooks/useUserData'; // Corrected import path

/**
 * A header component that displays user's gamification stats like level, points, and streak.
 * @param {Object} userData - The user's gamification data from Firestore.
 */
const GamificationHeader = ({ userData }) => {
    const theme = useTheme();
    const { level, pointsInCurrentLevel, progress, streak } = useUserData(userData);

    return (
        <View style={[styles.gamificationBar, { backgroundColor: theme.colors.surface }]}>
            {/* Level and Progress Block */}
            <View style={styles.statBlock}>
                <Text style={styles.statValue}>LVL {level}</Text>
                <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
                <Text style={styles.statLabel}>{pointsInCurrentLevel} / 100 PTS</Text>
            </View>
            {/* Day Streak Block */}
            <View style={styles.statBlock}>
                <Text style={styles.statValue}>🔥 {streak}</Text>
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
        marginTop: 8,
        elevation: 2, // Added subtle shadow for depth
    },
    statBlock: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: '#A9A9A9',
        marginTop: 4,
    },
    progressBar: {
        width: '80%',
        height: 6,
        borderRadius: 3,
        marginTop: 8,
    },
});

export default React.memo(GamificationHeader);