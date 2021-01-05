import { ScheduledEvent } from 'aws-lambda';
import { addDays, format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { google } from 'googleapis';
const credentials = require('../../credentials.json');

export async function handler(event: ScheduledEvent) {
    try {
        const utcDate = parseISO(event.time)
        const jstDate = utcToZonedTime(utcDate, 'Asia/Tokyo')
        const nextJstDate = addDays(jstDate, 1)
        const date = format(jstDate,'yyyy-MM-dd')
        const nextDate = format(nextJstDate,'yyyy-MM-dd')
        console.info(utcDate, jstDate, nextJstDate, date, nextDate)
        const calendarIds = process.env.CALENDAR_IDS!.split(',')
        const auth = new google.auth.JWT(
            credentials.client_email,
            undefined,
            credentials.private_key,
            ['https://www.googleapis.com/auth/calendar']);
        const calendar = google.calendar({version: 'v3', auth})

        for(let id of calendarIds){
            const list = await calendar.events.list({
                calendarId: id,
                timeMin: `${date}T00:00:00+09:00`,
                timeMax: `${nextDate}T00:00:00+09:00`,
                timeZone: 'Asia/Tokyo',
            })
            console.info(list.data.items)
        }
    } catch (err) {
        console.error(err)
    }
}
