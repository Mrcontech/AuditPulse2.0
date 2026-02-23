import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Using standard built-in fonts for maximum compatibility and reliability
const FONT_FAMILY = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';
const FONT_ITALIC = 'Helvetica-Oblique';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FCFCFD',
        fontFamily: FONT_FAMILY,
    },
    coverPage: {
        padding: 60,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#0A0C10',
        color: '#ffffff',
        fontFamily: FONT_FAMILY,
    },
    brandName: {
        fontFamily: FONT_BOLD,
        fontSize: 10,
        letterSpacing: 4,
        marginBottom: 40,
        color: '#60A5FA',
        textTransform: 'uppercase',
    },
    coverTitle: {
        fontFamily: FONT_BOLD,
        fontSize: 42,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -1,
    },
    coverSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 60,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    coverDomain: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 100,
        fontSize: 18,
        fontFamily: FONT_BOLD,
        color: '#F1F5F9',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 30,
        paddingBottom: 15,
        borderBottom: '1px solid #F1F5F9',
    },
    title: {
        fontSize: 16,
        fontFamily: FONT_BOLD,
        color: '#0F172A',
    },
    timestamp: {
        fontSize: 8,
        color: '#94A3B8',
        marginTop: 2,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: FONT_BOLD,
        color: '#1E293B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: 5,
    },
    card: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #F1F5F9',
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 10,
        lineHeight: 1.6,
        color: '#334155',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 15,
    },
    scoreCard: {
        width: '31%',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 6,
        border: '1px solid #F1F5F9',
    },
    scoreLabel: {
        fontSize: 7,
        color: '#64748B',
        textTransform: 'uppercase',
        fontFamily: FONT_BOLD,
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 16,
        fontFamily: FONT_BOLD,
        color: '#0F172A',
    },
    tag: {
        fontSize: 7,
        fontFamily: FONT_BOLD,
        textTransform: 'uppercase',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#EFF6FF',
        color: '#3B82F6',
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    featureIcon: {
        width: 12,
        height: 12,
        marginRight: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    listTitle: {
        fontSize: 10,
        fontFamily: FONT_BOLD,
        color: '#1E293B',
        marginBottom: 2,
    },
    listDesc: {
        fontSize: 9,
        color: '#64748B',
        lineHeight: 1.4,
    },
    raceHeader: {
        padding: 10,
        backgroundColor: '#0F172A',
        borderRadius: 6,
        marginBottom: 8,
    },
    raceTitle: {
        fontSize: 9,
        fontFamily: FONT_BOLD,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: '1px solid #F1F5F9',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7,
        color: '#94A3B8',
        fontFamily: FONT_FAMILY,
    }
});

export const AuditPDFReport = ({ audit, results }: { audit: any, results: any }) => (
    <Document title={`Audit Report - ${audit.domain}`}>
        {/* Cover Page */}
        <Page size="A4" style={styles.coverPage}>
            <Text style={styles.brandName}>AuditPulse Intelligence</Text>
            <View style={{ width: 80, height: 2, backgroundColor: '#3B82F6', marginBottom: 40 }} />
            <Text style={styles.coverTitle}>STRATEGIC GROWTH</Text>
            <Text style={styles.coverTitle}>& PERFORMANCE AUDIT</Text>
            <Text style={styles.coverSubtitle}>Comprehensive Market & Technical Analysis</Text>

            <View style={{ marginTop: 40 }}>
                <Text style={styles.coverDomain}>{audit.domain}</Text>
            </View>

            <View style={{ position: 'absolute', bottom: 60, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#64748B', letterSpacing: 1 }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
            </View>
        </Page>

        {/* Overview & KPIs */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{audit.domain}</Text>
                    <Text style={styles.timestamp}>Generated on {new Date().toLocaleDateString()}</Text>
                </View>
                <Text style={{ fontSize: 8, fontWeight: 800, color: '#94A3B8' }}>INTERNAL STRATEGY</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>I. Executive Vision</Text>
                <View style={[styles.card, { backgroundColor: '#F8FAFC', borderLeft: '3px solid #3B82F6' }]}>
                    <Text style={[styles.summaryText, { fontWeight: 600, marginBottom: 8 }]}>
                        "{results.executive_summary?.vision || results.executive_summary}"
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 7, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>The Challenge</Text>
                            <Text style={{ fontSize: 9, color: '#334155' }}>{results.executive_summary?.core_tension}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 7, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>The Opportunity</Text>
                            <Text style={{ fontSize: 9, color: '#334155' }}>{results.executive_summary?.one_line_pitch}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>II. Core Health Metrics</Text>
                <View style={styles.grid}>
                    {[
                        { label: 'Performance', val: `${Math.round(results.performance_score)}/100` },
                        { label: 'SEO Authority', val: `${results.seo_score}/100` },
                        { label: 'Security', val: `${results.security_score}/100` },
                        { label: 'LCP (Desktop)', val: `${results.lcp_desktop}s` },
                        { label: 'Pages Scanned', val: results.pages_crawled || '—' },
                        { label: 'Mobile Score', val: results.performance_score_mobile || '—' }
                    ].map((m, i) => (
                        <View key={i} style={styles.scoreCard}>
                            <Text style={styles.scoreLabel}>{m.label}</Text>
                            <Text style={styles.scoreValue}>{m.val}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>III. Market Positioning</Text>
                <View style={styles.grid}>
                    <View style={[styles.card, { width: '48%' }]}>
                        <Text style={styles.tag}>Brand Archetype</Text>
                        <Text style={styles.listTitle}>{results.market_positioning?.archetype || 'N/A'}</Text>
                        <Text style={styles.listDesc}>{results.market_positioning?.positioning_statement}</Text>
                    </View>
                    <View style={[styles.card, { width: '48%' }]}>
                        <Text style={styles.tag}>Competitive Moat</Text>
                        <Text style={styles.listTitle}>Unique Value Prop</Text>
                        <Text style={styles.listDesc}>{results.market_positioning?.narrative_moat || 'N/A'}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.footer}>AuditPulse Private Strategic Report • {audit.domain} • Page 2</Text>
        </Page>

        {/* Psychological Analysis & SWOT */}
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>IV. Conversion Psychology</Text>
                <View style={styles.card}>
                    <Text style={{ fontSize: 9, fontWeight: 800, color: '#64748B', marginBottom: 10 }}>USER INTENTION (JTBD)</Text>
                    <Text style={styles.summaryText}>{results.conversion_psychology?.jtbd || 'Analysis pending...'}</Text>
                </View>
                <View style={styles.grid}>
                    <View style={[styles.card, { width: '48%', backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
                        <Text style={[styles.tag, { backgroundColor: '#EF4444', color: '#FFFFFF' }]}>Customer Barriers</Text>
                        <Text style={styles.listDesc}>{results.conversion_psychology?.friction_points || 'N/A'}</Text>
                    </View>
                    <View style={[styles.card, { width: '48%', backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                        <Text style={[styles.tag, { backgroundColor: '#22C55E', color: '#FFFFFF' }]}>Persuasion Hooks</Text>
                        <Text style={styles.listDesc}>{results.conversion_psychology?.conversion_hooks || 'N/A'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>V. Strategic SWOT Analysis</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {results.swot_analysis && Object.entries(results.swot_analysis).map(([key, list]: [string, any], i) => (
                        <View key={i} style={{ width: '48%', padding: 12, backgroundColor: '#F8FAFC', borderRadius: 6, border: '1px solid #F1F5F9' }}>
                            <Text style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', color: '#1E293B', marginBottom: 6 }}>{key}</Text>
                            {list.map((item: string, j: number) => (
                                <Text key={j} style={{ fontSize: 8, color: '#475569', marginBottom: 3 }}>• {item}</Text>
                            ))}
                        </View>
                    ))}
                </View>
            </View>

            <Text style={styles.footer}>AuditPulse Private Strategic Report • {audit.domain} • Page 3</Text>
        </Page>

        {/* Growth Roadmap & Recommendations */}
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>VI. The growth roadmap (RACE)</Text>
                {results.growth_roadmap && Object.entries(results.growth_roadmap).map(([stage, data]: [string, any], i) => (
                    <View key={i} style={{ marginBottom: 15 }}>
                        <View style={styles.raceHeader}>
                            <Text style={styles.raceTitle}>{data.title || stage} Stage</Text>
                        </View>
                        <View style={{ paddingLeft: 10, borderLeft: '1px solid #E2E8F0', marginLeft: 5 }}>
                            {Array.isArray(data.steps) && data.steps.map((step: string, j: number) => (
                                <View key={j} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <Text style={{ fontSize: 8, color: '#3B82F6', marginRight: 6, marginTop: 2 }}>→</Text>
                                    <Text style={{ fontSize: 9, color: '#334155', flex: 1 }}>{step}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>VII. Priority Implementations</Text>
                {results.strategic_recommendations?.slice(0, 4).map((rec: any, i: number) => (
                    <View key={i} style={[styles.card, { padding: 12, marginBottom: 8 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View style={{ width: 14, height: 14, borderRadius: 100, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                <Text style={{ fontSize: 8, fontWeight: 800, color: '#FFFFFF' }}>{i + 1}</Text>
                            </View>
                            <Text style={{ fontSize: 10, fontWeight: 600, color: '#0F172A' }}>{rec.title}</Text>
                        </View>
                        <Text style={{ fontSize: 9, color: '#64748B', lineHeight: 1.4, marginLeft: 22 }}>{rec.description}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Text>AuditPulse Private Strategic Report • {audit.domain}</Text>
                <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </View>
        </Page>
    </Document>
);
