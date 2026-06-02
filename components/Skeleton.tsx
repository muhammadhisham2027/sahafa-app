import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "../lib/theme";

export function SkeletonBox({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const t = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: 6, backgroundColor: t.border, opacity }, style]}
    />
  );
}

export function SkeletonCard() {
  const t = useTheme();
  return (
    <View style={[styles.card, { borderBottomColor: t.border }]}>
      <View style={styles.meta}>
        <SkeletonBox width={80} height={10} />
        <SkeletonBox width={50} height={10} style={{ marginLeft: 8 }} />
      </View>
      <View style={styles.body}>
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox width="95%" height={14} />
          <SkeletonBox width="80%" height={14} />
          <SkeletonBox width="60%" height={14} style={{ marginTop: 4 }} />
        </View>
        <SkeletonBox width={80} height={80} style={{ borderRadius: 8 }} />
      </View>
      <View style={styles.footer}>
        <SkeletonBox width={60} height={20} style={{ borderRadius: 10 }} />
        <SkeletonBox width={40} height={20} style={{ borderRadius: 10 }} />
      </View>
    </View>
  );
}

export function SkeletonFeed() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
    </>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  meta: { flexDirection: "row", marginBottom: 12 },
  body: { flexDirection: "row", gap: 12, marginBottom: 12 },
  footer: { flexDirection: "row", gap: 8 },
});
