
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

const PRIMARY = '#157efb';
const SECONDARY = '#4a90e2';
const BG_LIGHT = '#f8fbff';
const CARD_BG = '#fff';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 120;

// Metrics
const fakeMetrics = {
  totalTasks: 385,
  totalEvents: 73,
  totalNotes: 54,
  avgProductivity: 66.8,
};
const weeklyProductivity = [60, 65, 80, 70, 55, 60, 67];
const dailyTasks = [12, 17, 15, 20, 13, 18, 19];
const eventsPerDay = [1, 3, 2, 5, 0, 4, 3];

// Hotchart data (5 weeks, 7 days per week)
const hotchartData = [
  [7, 2, 6, 9, 5, 1, 0],
  [3, 5, 8, 11, 4, 2, 1],
  [11, 6, 2, 2, 7, 0, 0],
  [2, 0, 7, 6, 9, 13, 3],
  [5, 7, 9, 12, 8, 4, 2],
];
const maxHotVal = Math.max(...hotchartData.flat());

export default function DashboardScreen() {
  // Scale bars/lines by maxima
  const maxTasks = Math.max(...dailyTasks);
  const maxEvents = Math.max(...eventsPerDay);
  const maxProd = Math.max(...weeklyProductivity);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Metrics cards */}
      <View style={styles.cardsRow}>
        <MetricCard label="Total Tasks (30d)" value={fakeMetrics.totalTasks} color={PRIMARY} />
        <MetricCard label="Events Attended (30d)" value={fakeMetrics.totalEvents} color={SECONDARY} />
      </View>
      <View style={styles.cardsRow}>
        <MetricCard label="Notes Created (30d)" value={fakeMetrics.totalNotes} color="#f3903f" />
        <MetricCard label="Avg. Productivity" value={`${fakeMetrics.avgProductivity}`} color="#4caf50" />
      </View>

      {/* Hotchart Activity (heatmap) */}
      <Text style={styles.sectionTitle}>30-Day Activity Hotchart</Text>
      <HotChart data={hotchartData} max={maxHotVal} />

      {/* Line Chart: Productivity */}
      <Text style={styles.sectionTitle}>Weekly Productivity Trend</Text>
      <LineChart data={weeklyProductivity} maxValue={maxProd} />

      {/* Bar Chart: Tasks per Day */}
      <Text style={styles.sectionTitle}>Tasks Completed Per Day</Text>
      <BarChart data={dailyTasks} maxValue={maxTasks} color={PRIMARY} />

      {/* Bar Chart: Events per Day */}
      <Text style={styles.sectionTitle}>Events Attended Per Day</Text>
      <BarChart data={eventsPerDay} maxValue={maxEvents} color={SECONDARY} />

      {/* Analysis */}
      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>Analysis Summary</Text>
        <Text style={styles.analysisText}>
          Your weekly productivity is strong at <Text style={{ fontWeight: '700' }}>{fakeMetrics.avgProductivity}</Text>. 
          Most tasks and events cluster mid-week, reflective of consistent focus and time management. The activity hotchart visualizes your busiest and lightest days at a glance.
        </Text>
      </View>
    </ScrollView>
  );
}

// ------- Helper Components -------

function MetricCard({ label, value, color }) {
  return (
    <View style={[styles.metricCard, { borderColor: color }]}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function LineChart({ data, maxValue }) {
  const points = data.map((val, i) => ({
    x: (CHART_WIDTH / (data.length - 1)) * i,
    y: CHART_HEIGHT - (val / maxValue) * CHART_HEIGHT,
  }));

  return (
    <View style={styles.chartContainer}>
      {[...Array(5)].map((_, idx) => (
        <View key={idx} style={[styles.gridLine, { top: (CHART_HEIGHT / 4) * idx }]} pointerEvents="none" />
      ))}
      {points.map((point, i) => {
        if (i === points.length - 1) return null;
        const next = points[i + 1];
        const dx = next.x - point.x;
        const dy = next.y - point.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y,
              width: len,
              height: 2,
              backgroundColor: PRIMARY,
              transform: [{ rotateZ: `${angle}deg` }],
              borderRadius: 1,
            }}
          />
        );
      })}
      {points.map((point, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: point.x - 5,
            top: point.y - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: PRIMARY,
          }}
        />
      ))}
    </View>
  );
}

function BarChart({ data, maxValue, color }) {
  return (
    <View style={[styles.chartContainer, { flexDirection: 'row', justifyContent: 'space-between' }]}>
      {data.map((val, i) => (
        <View key={i} style={{ alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 12,
              height: (val / maxValue) * CHART_HEIGHT,
              backgroundColor: color,
              borderRadius: 6,
            }}
          />
          <Text style={styles.barLabel}>Day {i + 1}</Text>
        </View>
      ))}
    </View>
  );
}

function HotChart({ data, max }) {
  return (
    <View style={styles.hotchartContainer}>
      {data.map((week, i) => (
        <View style={styles.hotchartRow} key={i}>
          {week.map((value, j) => (
            <View
              key={j}
              style={[
                styles.hotchartCell,
                {
                  backgroundColor: getHeatColor(value, max),
                  borderColor: value > 0 ? '#aac9fc' : '#eef3fa',
                },
              ]}
              accessibilityLabel={`Day ${j + 1}, Week ${i + 1}: ${value} tasks`}
            >
              {value > 0 && <Text style={styles.hotchartValue}>{value}</Text>}
            </View>
          ))}
        </View>
      ))}
      <View style={styles.hotchartLegendRow}>
        <Text style={styles.hotchartLegend}>Low</Text>
        <View style={[styles.hotchartLegendSwatch, { backgroundColor: getHeatColor(1, max) }]} />
        <View style={[styles.hotchartLegendSwatch, { backgroundColor: getHeatColor(Math.round(max / 3), max) }]} />
        <View style={[styles.hotchartLegendSwatch, { backgroundColor: getHeatColor(Math.round(2 * max / 3), max) }]} />
        <View style={[styles.hotchartLegendSwatch, { backgroundColor: getHeatColor(max, max) }]} />
        <Text style={styles.hotchartLegend}>High</Text>
      </View>
    </View>
  );
}

function getHeatColor(val, max) {
  if (val === 0) return '#eef3fa';
  const alpha = 0.25 + 0.75 * (val / max);
  return `rgba(21,126,251,${alpha.toFixed(2)})`;
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BG_LIGHT, paddingTop: 40, paddingHorizontal: 24 },
  title:        { fontSize: 32, fontWeight: '700', color: '#222', marginBottom: 20 },
  cardsRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metricCard:   { flex: 1, backgroundColor: CARD_BG, borderRadius: 12, paddingVertical: 18, paddingHorizontal: 16, marginHorizontal: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: PRIMARY, shadowOpacity: 0.12, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, },
  metricValue:  { fontSize: 28, fontWeight: '700' },
  metricLabel:  { fontSize: 14, color: '#555', marginTop: 6, textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 32, marginBottom: 8 },

  // Hotchart styles
  hotchartContainer:     { backgroundColor: CARD_BG, borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 24, elevation: 2, shadowColor: PRIMARY, shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, },
  hotchartRow:           { flexDirection: 'row', marginBottom: 7 },
  hotchartCell:          { width: 34, height: 34, borderRadius: 7, marginHorizontal: 3.5, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  hotchartValue:         { color: '#fff', fontWeight: '700', fontSize: 15 },
  hotchartLegendRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 2 },
  hotchartLegend:        { fontSize: 12, color: '#577', fontWeight: '500', marginHorizontal: 8 },
  hotchartLegendSwatch:  { width: 20, height: 12, borderRadius: 5, marginHorizontal: 1, borderWidth: 1, borderColor: '#dde1e9' },

  // Charts
  chartContainer: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 24,
    position: 'relative',
  },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#eee' },
  barLabel: { fontSize: 10, color: '#666', marginTop: 6 },

  // Analysis
  analysisContainer: { backgroundColor: CARD_BG, padding: 18, borderRadius: 12, marginTop: 4, marginBottom: 36, elevation: 3, shadowColor: '#aaa', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 1 }, shadowRadius: 6, },
  analysisTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#222' },
  analysisText: { fontSize: 15, lineHeight: 22, color: '#444' },
});
