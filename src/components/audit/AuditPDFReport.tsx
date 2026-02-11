import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    coverPage: {
        padding: 60,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#0F172A',
        color: '#ffffff',
    },
    brandName: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 10,
        color: '#3b82f6',
    },
    coverTitle: {
        fontSize: 48,
        fontWeight: 'black',
        textAlign: 'center',
        marginBottom: 20,
    },
    coverSubtitle: {
        fontSize: 18,
        opacity: 0.6,
        marginBottom: 80,
    },
    coverDomain: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        fontSize: 24,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        paddingBottom: 20,
        borderBottom: '1px solid #e2e8f0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    timestamp: {
        fontSize: 10,
        color: '#64748b',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 15,
        borderLeft: '4px solid #3b82f6',
        paddingLeft: 10,
    },
    summaryCard: {
        padding: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        marginBottom: 20,
    },
    summaryText: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#334155',
        fontStyle: 'italic',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 20,
    },
    scoreCard: {
        width: '45%',
        padding: 15,
        backgroundColor: '#f1f5f9',
        borderRadius: 6,
    },
    scoreLabel: {
        fontSize: 9,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    scoreValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
    },
    listNumber: {
        width: 25,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    listContent: {
        flex: 1,
    },
    listTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 3,
    },
    listDesc: {
        fontSize: 10,
        color: '#64748b',
        lineHeight: 1.4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        borderTop: '1px solid #e2e8f0',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#94a3b8',
    }
});

export const AuditPDFReport = ({ audit, results }: { audit: any, results: any }) => (
    <Document>
        {/* Cover Page */}
        <Page size="A4" style={styles.coverPage}>
            <Text style={styles.brandName}>AUDITPULSE</Text>
            <Text style={styles.coverTitle}>STRATEGIC GROWTH AUDIT</Text>
            <Text style={styles.coverSubtitle}>Performance, SEO & Growth Insights</Text>
            <Text style={styles.coverDomain}>{audit.domain}</Text>
            <View style={{ marginTop: 100, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, opacity: 0.5 }}>Prepared exclusively for {audit.domain} stakeholders</Text>
            </View>
        </Page>

        {/* Content Page */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{audit.domain}</Text>
                    <Text style={styles.timestamp}>Generated: {new Date().toLocaleDateString()}</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#64748b' }}>CONFIDENTIAL REPORT</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Executive Summary</Text>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>{results.executive_summary}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
                <View style={styles.grid}>
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>Performance Score</Text>
                        <Text style={styles.scoreValue}>{results.performance_score}/100</Text>
                    </View>
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>SEO Authority</Text>
                        <Text style={styles.scoreValue}>{results.seo_score}/100</Text>
                    </View>
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>Security Status</Text>
                        <Text style={styles.scoreValue}>{results.security_score}/100</Text>
                    </View>
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>LCP (Desktop)</Text>
                        <Text style={styles.scoreValue}>{results.lcp_desktop}s</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Brand Voice & UX Insight</Text>
                <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Voice Analysis:</Text>
                    <Text style={{ fontSize: 10, color: '#334155', lineHeight: 1.5 }}>{results.brand_voice_analysis}</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>UX Friction Points:</Text>
                    {results.ux_friction_points?.map((point: any, i: number) => (
                        <Text key={i} style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>• {point}</Text>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Text>AuditPulse Strategic Report • {audit.domain}</Text>
                <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </View>
        </Page>

        {/* Action Strategy Page */}
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>High-Priority Strategic Recommendations</Text>
                {results.strategic_recommendations?.map((rec: any, i: number) => (
                    <View key={i} style={styles.listItem}>
                        <Text style={styles.listNumber}>{i + 1}</Text>
                        <View style={styles.listContent}>
                            <Text style={styles.listTitle}>{rec.title}</Text>
                            <Text style={styles.listDesc}>{rec.description}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>SWOT Analysis</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {results.swot_analysis && Object.entries(results.swot_analysis).map(([key, list]: [string, any], i) => (
                        <View key={i} style={{ width: '48%', padding: 10, backgroundColor: '#f8fafc', borderRadius: 6 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: '#1e293b', marginBottom: 5 }}>{key}</Text>
                            {list.map((item: string, j: number) => (
                                <Text key={j} style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>- {item}</Text>
                            ))}
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Text>AuditPulse Strategic Report • {audit.domain}</Text>
                <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </View>
        </Page>
    </Document>
);
