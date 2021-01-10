import { ScheduledEvent } from 'aws-lambda';
import { ManagedUpload, PutObjectRequest } from 'aws-sdk/clients/s3';
import { addDays, addMinutes, addSeconds, format, isWithinInterval, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { google } from 'googleapis';
import S3 = require('aws-sdk/clients/s3');
const credentials = require('../../credentials.json');

const bucketName = process.env.BUCKET_NAME!

const s3 = new S3({
    region: 'ap-northeast-1'
})

export async function handler(event: ScheduledEvent) {
    try {
        const utcDate = parseISO(event.time)
        const jstDate = utcToZonedTime(utcDate, 'Asia/Tokyo')
        const nextJstDate = addDays(jstDate, 1)
        const date = format(jstDate,'yyyy-MM-dd')
        const nextDate = format(nextJstDate,'yyyy-MM-dd')
        const auth = new google.auth.JWT(
            credentials.client_email,
            undefined,
            credentials.private_key,
            ['https://www.googleapis.com/auth/calendar']);
        const calendar = google.calendar({version: 'v3', auth})
        const dayRangeStart = `${date}T00:00:00+09:00`
        const dayRangeEnd = `${nextDate}T00:00:00+09:00`

        const calendarList = JSON.parse(process.env.CALENDAR_LIST!) as {name: string, calendarId: string}[]
        for(let { name, calendarId } of calendarList){
            const list = await calendar.events.list({
                calendarId: calendarId,
                timeMin: dayRangeStart,
                timeMax: dayRangeEnd,
                timeZone: 'Asia/Tokyo',
            })
            const scheduleList = list.data.items!.map(item => {
                return {
                    start: item.start?.dateTime,
                    end: item.end?.dateTime
                }
            })
            const dayStart = strToJST(dayRangeStart)
            const obj: {[key: string]: number} = {}
            for (let i = 0; i < 60/5 * 24; i++) {
                const date = addSeconds(addMinutes(dayStart, i * 5), 1)
                const dateFormat = format(date,'HH:mm')
                if (scheduleList.some(time => isWithinInterval(date, {start: strToJST(time.start!), end: strToJST(time.end!)}))) {
                    obj[dateFormat] = 1
                } else {
                    obj[dateFormat] = 0
                }
            }
            const csvStr = objectToCSV(obj)
            const params: PutObjectRequest = {
                Bucket: bucketName,
                Key: `${date}/${name}.csv`,
                Body: csvStr,
                ContentType: 'text/csv'
            }
            s3.upload(params, undefined,(err: Error, data: ManagedUpload.SendData) => {
                if (err) {
                    console.error(err)
                } else {
                    console.info('Successfully uploaded file.', data)
                }
            })
        }
    } catch (err) {
        console.error(err)
    }
}

function strToJST(time: string) {
    return utcToZonedTime(parseISO(time), 'Asia/Tokyo')
}

function objectToCSV(obj: {[key: string]: number}) {
    const header = `time,usage\n`
    const body = Object.keys(obj).sort().map(key => {
        return key +','+obj[key]
    }).join('\n')
    return `${header}${body}`
}
