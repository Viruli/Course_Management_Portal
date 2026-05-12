import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  ChevronDown, Cast, MoreVertical, Play, Pause, BookOpen, Clock, Check,
  ChevronLeft, ChevronRight, Save, Download, FileText, FilePen, Video,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { Button } from '../../components/Button';
import { LESSON } from '../../data/mock';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

const matIcons: Record<string, any> = { FileText, FilePen, Video };

export function LessonPlayerScreen({ onBack, onComplete }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [tab, setTab] = useState('about');
  const [playing, setPlaying] = useState(true);
  const [notes, setNotes] = useState(
    '• Slope = rise / run\n• y-intercept is where the line crosses the y-axis\n• Practice example 3 again before quiz.'
  );

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.video}>
        <View style={styles.videoTop}>
          <IconBtn dark onPress={onBack}><ChevronDown size={20} color={colors.white} /></IconBtn>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <IconBtn dark onPress={() => toast.info('Looking for cast devices…')}><Cast size={18} color={colors.white} /></IconBtn>
            <IconBtn dark onPress={() => toast.info('More options coming soon.')}><MoreVertical size={18} color={colors.white} /></IconBtn>
          </View>
        </View>

        <View style={styles.videoCenter}>
          <Text style={styles.eq}>y = mx + b</Text>
          <Text style={styles.eqSub}>Slope-intercept form</Text>
        </View>

        <Pressable onPress={() => setPlaying(!playing)} style={styles.playBtn}>
          {playing ? <Pause size={26} color={colors.primary} /> : <Play size={26} color={colors.primary} />}
        </Pressable>

        <View style={styles.progressOverlay}>
          <View style={styles.progressTime}>
            <Text style={styles.progressTimeText}>9:24</Text>
            <Text style={styles.progressTimeText}>{LESSON.duration}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
            <View style={styles.progressKnob} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.lessonNum}>{LESSON.number.toUpperCase()}</Text>
          <Text style={styles.lessonTitle}>{LESSON.title}</Text>
          <View style={styles.meta}>
            <BookOpen size={11} color={colors.bodyGreen} />
            <Text style={styles.metaText}>{LESSON.course}</Text>
            <View style={styles.dot} />
            <Clock size={11} color={colors.bodyGreen} />
            <Text style={styles.metaText}>{LESSON.duration}</Text>
          </View>
        </View>

        <Tabs
          items={[
            { id: 'about', label: 'About' },
            { id: 'materials', label: 'Materials', count: LESSON.materials.length },
            { id: 'notes', label: 'Notes' },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'about' && (
          <Text style={styles.desc}>{LESSON.desc}</Text>
        )}

        {tab === 'materials' && (
          <View style={{ gap: 8 }}>
            {LESSON.materials.map(m => {
              const Icon = matIcons[m.ico] ?? FileText;
              return (
                <View key={m.name} style={styles.matRow}>
                  <View style={styles.matIcon}>
                    <Icon size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matName}>{m.name}</Text>
                    <Text style={styles.matSize}>{m.size}</Text>
                  </View>
                  <IconBtn onPress={() => toast.success(`Downloading ${m.name}.`)}><Download size={16} color={colors.primary} /></IconBtn>
                </View>
              );
            })}
          </View>
        )}

        {tab === 'notes' && (
          <View style={{ gap: 10 }}>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              style={styles.notes}
              textAlignVertical="top"
            />
            <Button variant="secondary" full leftIcon={<Save size={16} color={colors.primary} />} onPress={() => toast.success('Notes saved.')}>Save notes</Button>
          </View>
        )}
      </ScrollView>

      <View style={styles.stickyBar}>
        <Button variant="secondary" size="lg" leftIcon={<ChevronLeft size={16} color={colors.primary} />} onPress={() => toast.info('Previous lesson.')} />
        <View style={{ flex: 1 }}>
          <Button size="lg" full leftIcon={<Check size={16} color={colors.white} />} onPress={() => { toast.success('Lesson marked complete.'); onComplete(); }}>Mark complete</Button>
        </View>
        <Button variant="secondary" size="lg" leftIcon={<ChevronRight size={16} color={colors.primary} />} onPress={() => toast.info('Next lesson.')} />
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  video: {
    height: 230,
    backgroundColor: '#0E1A16',
    overflow: 'hidden',
    position: 'relative',
  },
  videoTop: {
    position: 'absolute', top: 8, left: 8, right: 8, zIndex: 4,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  videoCenter: { position: 'absolute', top: '50%', left: 24, right: 24, marginTop: -30, alignItems: 'center' },
  eq: { fontSize: 22, color: 'rgba(255,255,255,0.85)', fontWeight: '700', letterSpacing: -0.4 },
  eqSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  playBtn: {
    position: 'absolute', top: '50%', left: '50%', marginLeft: -30, marginTop: -30,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(188,233,85,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 8,
  },
  progressOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  progressTime: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressTimeText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 4, overflow: 'visible', position: 'relative' },
  progressFill: { position: 'absolute', left: 0, top: 0, height: '100%', width: '64%', backgroundColor: colors.accent, borderRadius: 4 },
  progressKnob: { position: 'absolute', left: '64%', top: -4, marginLeft: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, borderColor: 'rgba(188,233,85,0.20)', borderWidth: 4 },
  lessonNum: { fontSize: 11, color: colors.bodyGreen, fontWeight: '700', letterSpacing: 0.6 },
  lessonTitle: { fontSize: 20, fontWeight: '700', color: colors.primary, letterSpacing: -0.4, marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  metaText: { fontSize: 11, fontWeight: '500', color: colors.bodyGreen },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, marginHorizontal: 2 },
  desc: { fontSize: 14, color: colors.bodyGreen, lineHeight: 20 },
  matRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 12,
  },
  matIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  matName: { fontSize: 13, fontWeight: '700', color: colors.primary },
  matSize: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },
  notes: {
    minHeight: 140, padding: 12,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 12,
    fontSize: 13, color: colors.primary, lineHeight: 18,
  },
  stickyBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopColor: colors.stroke, borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
});
