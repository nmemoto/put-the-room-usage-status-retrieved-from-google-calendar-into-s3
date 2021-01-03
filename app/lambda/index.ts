import { Context, ScheduledEvent } from 'aws-lambda';

export async function handler(event: ScheduledEvent, context: Context) {
    console.info("handler")
}
