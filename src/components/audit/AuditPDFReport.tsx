import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    subtitle: {
        fontSize: 12,
        color: '#666666',
        marginTop: 5,
    },
    section: {
        margin: 10,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#3b82f6',
        borderBottomWidth: 1,
        borderBottomColor: '#3b82f6',
        paddingBottom: 5,
    },
    content: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#333333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    label: {
        fontWeight: 'bold',
    },
    score: {
        fontWeight: 'bold',
        color: '#f97316',
    }
});

export const AuditPDFReport = ({ audit, results }: { audit: any, results: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>AuditPulse Strategic Roadmap</Text>
                <Text style={styles.subtitle}>Analysis for: {audit.domain}</Text>
                <Text style={styles.subtitle}>Generated on: {new Date().toLocaleDateString()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Executive Summary</Text>
                <Text style={styles.content}>{results.executive_summary}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Metrics (Desktop)</Text>
                <View style={styles.row}>
                    <Text style={styles.content}>Performance Score</Text>
                    <Text style={styles.score}>{results.performance_score}/100</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.content}>Largest Contentful Paint</Text>
                    <Text style={styles.content}>{results.lcp_desktop}s</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.content}>Cumulative Layout Shift</Text>
                    <Text style={styles.content}>{results.cls_desktop}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security Audit</Text>
                <View style={styles.row}>
                    <Text style={styles.content}>Security Score</Text>
                    <Text style={styles.score}>{results.security_score}/100</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.content}>SSL Status</Text>
                    <Text style={styles.content}>{results.ssl_valid ? 'Secure' : 'Insecure'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Market Intelligence</Text>
                <Text style={styles.content}>{results.market_insights}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Strategic Recommendations</Text>
                {results.strategic_recommendations?.map((rec: any, i: number) => (
                    <View key={i} style={{ marginBottom: 10 }}>
                        <Text style={[styles.content, { fontWeight: 'bold' }]}>{i + 1}. {rec.title}</Text>
                        <Text style={styles.content}>{rec.description}</Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);
