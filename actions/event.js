'use server';

import { db } from '@/lib/prisma';

const EVENT_TYPE_MAP = {
  'Festival': 'FESTIVAL',
  'Concert': 'CONCERT',
  'Sports': 'SPORTS',
  'Political': 'POLITICAL',
  'Religious': 'RELIGIOUS',
  'Corporate': 'CORPORATE',
  'Educational': 'EDUCATIONAL',
  'Other': 'OTHER',
  'Political Rally': 'POLITICAL',
  'Sports Event': 'SPORTS',
  'Construction': 'OTHER',
  'Emergency Gathering': 'OTHER',
};

const EVENT_STATUS_MAP = {
  'Scheduled': 'SCHEDULED',
  'Active': 'ONGOING',
  'Monitoring': 'ONGOING',
  'Resolved': 'COMPLETED',
  'Ongoing': 'ONGOING',
  'Completed': 'COMPLETED',
  'Cancelled': 'CANCELLED',
};

export async function createEvent(formData) {
  const eventName = String(formData.get('eventName') ?? '').trim();
  const eventTypeLabel = String(formData.get('eventType') ?? '').trim();
  const eventCause = String(formData.get('eventCause') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const latitude = Number(formData.get('latitude'));
  const longitude = Number(formData.get('longitude'));
  const crowdSize = Number(formData.get('crowdSize') ?? 0);
  const startTime = new Date(String(formData.get('startTime') ?? ''));
  const endTime = new Date(String(formData.get('endTime') ?? ''));
  const statusLabel = String(formData.get('status') ?? 'Scheduled').trim();

  if (!eventName || !eventTypeLabel || !location || Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(crowdSize) || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return {
      success: false,
      error: 'Please fill in all required fields with valid values.',
    };
  }

  const eventType = EVENT_TYPE_MAP[eventTypeLabel] ?? 'OTHER';
  const status = EVENT_STATUS_MAP[statusLabel] ?? 'SCHEDULED';

  try {
    const event = await db.event.create({
      data: {
        eventName,
        eventType,
        eventCause: eventCause || null,
        crowdSize,
        location,
        latitude,
        longitude,
        startTime,
        endTime,
        status,
      },
    });

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error('Error creating event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}