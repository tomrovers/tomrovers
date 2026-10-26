import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { nameOf } from './people';
import { dayKey } from './state';
import * as storage from './storage';
import { useCouple } from './store';

// The daily check-in reminder. It lives on this phone only: each partner picks their own time.
// Instead of one repeating notification we plan the next two weeks one day at a time, so today's
// reminder can be skipped once you have checked in. The plan is refreshed whenever the app opens.

export type Reminder = { on: boolean; hour: number; minute: number };

const KEY = 'samen.reminder';
const CHANNEL = 'checkin';
const DAYS_AHEAD = 14;
export const defaultReminder: Reminder = { on: false, hour: 20, minute: 0 };

/** Notifications only exist in the phone app, not in the web version. */
export const remindersSupported = Platform.OS !== 'web';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export async function loadReminder(): Promise<Reminder> {
  const raw = await storage.load(KEY);
  if (!raw) return defaultReminder;
  try {
    return { ...defaultReminder, ...JSON.parse(raw) };
  } catch {
    return defaultReminder;
  }
}

export const saveReminder = (r: Reminder) => storage.save(KEY, JSON.stringify(r));

export const timeLabel = ({ hour, minute }: Pick<Reminder, 'hour' | 'minute'>) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

/** Asks for permission (once) and sets up the Android channel. Returns false if notifications are off. */
export async function allowReminders(): Promise<boolean> {
  if (!remindersSupported) return false;
  // On Android 13+ the permission prompt only appears once a channel exists.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Dagelijkse check-in',
      importance: AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

const messages = (partner: string) => [
  { title: 'Even inchecken? 💛', body: `Hoe gaat het met je vandaag? ${partner} hoort het graag.` },
  { title: 'Jullie moment van de dag', body: 'Twee minuten: je check-in, een klein gebaar en de gesprekskaart.' },
  { title: 'Hoe is je dag?', body: `Laat ${partner} weten waar je behoefte aan hebt.` },
];

/** Replaces the planned reminders. Skips today if you already checked in or the time has passed. */
export async function planReminders(r: Reminder, opts: { checkedInToday: boolean; partnerName: string }) {
  if (!remindersSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!r.on || !(await Notifications.getPermissionsAsync()).granted) return;
    const now = new Date();
    const texts = messages(opts.partnerName);
    for (let i = opts.checkedInToday ? 1 : 0; i <= DAYS_AHEAD; i++) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, r.hour, r.minute);
      if (at <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { ...texts[at.getDate() % texts.length], data: { url: '/checkin' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
      });
    }
  } catch (e) {
    console.warn('Herinneringen plannen mislukt', e);
  }
}

export async function cancelReminders() {
  if (!remindersSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nothing planned.
  }
}

/** Keeps the plan up to date and opens the check-in when a reminder is tapped. Use once, inside the couple screens. */
export function useReminders() {
  const { state } = useCouple();
  const doneDay = state.today.mine ? state.today.day : null;
  const partnerName = nameOf(state, state.partnerId);

  useEffect(() => {
    if (!remindersSupported) return;
    // Compare with the date at planning time: the app may come back to the front on a new day.
    const plan = () => void loadReminder().then(r => planReminders(r, { checkedInToday: doneDay === dayKey(), partnerName }));
    plan();
    const sub = AppState.addEventListener('change', s => s === 'active' && plan());
    return () => sub.remove();
  }, [doneDay, partnerName]);

  useEffect(() => {
    if (!remindersSupported) return;
    const open = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      if (response.notification.request.content.data?.url === '/checkin') router.push('/checkin');
      void Notifications.clearLastNotificationResponseAsync();
    };
    void Notifications.getLastNotificationResponseAsync().then(open);
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, []);
}
