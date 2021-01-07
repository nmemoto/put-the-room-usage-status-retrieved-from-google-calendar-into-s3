import { ScheduledEvent } from 'aws-lambda';
import { addDays, addMinutes, format, isWithinInterval, parseISO } from 'date-fns';
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
        const calendarIds = process.env.CALENDAR_IDS!.split(',')
        const auth = new google.auth.JWT(
            credentials.client_email,
            undefined,
            credentials.private_key,
            ['https://www.googleapis.com/auth/calendar']);
        const calendar = google.calendar({version: 'v3', auth})
        const dayRangeStart = `${date}T00:00:00+09:00`
        const dayRangeEnd = `${nextDate}T00:00:00+09:00`

        for(let id of calendarIds){
            const list = await calendar.events.list({
                calendarId: id,
                timeMin: dayRangeStart,
                timeMax: dayRangeEnd,
                timeZone: 'Asia/Tokyo',
            })
            const meetingTimeList = list.data.items!.map(item => {
                return {
                    start: item.start?.dateTime,
                    end: item.end?.dateTime
                }
            })
            console.info(meetingTimeList)
            const dayStart = strToJST(dayRangeStart)
            const obj: {[key: string]: number} = {}
            for (let i = 0; i < 60/5 * 24; i++) {
                const date = addMinutes(dayStart, i * 5)
                const dateFormat = format(date,'HH:mm')
                if (meetingTimeList.some(time => isWithinInterval(date, {start: strToJST(time.start!), end: strToJST(time.end!)}))) {
                    obj[dateFormat] = 1
                } else {
                    obj[dateFormat] = 0
                }
            }
            const csvStr = objectToCSV(obj)
            console.info(csvStr)
        }
    } catch (err) {
        console.error(err)
    }
}

function strToJST(time: string) {
    return utcToZonedTime(parseISO(time), 'Asia/Tokyo')
}

function objectToCSV(obj: {[key: string]: number}) {
    return Object.keys(obj).sort().map(key => {
        return key +','+obj[key]
    }).join('\n')
}
