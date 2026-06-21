'use server';

import { db } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

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

export async function createEvent(stateOrFormData, formData) {
  const data = formData || stateOrFormData;

  // 1. Get current clerk user
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      error: 'Unauthorized: Please log in to create an event.',
    };
  }

  if (!data || typeof data.get !== 'function') {
    return {
      success: false,
      error: 'Invalid form submission.',
    };
  }

  const eventName = String(data.get('eventName') ?? '').trim();
  const eventTypeLabel = String(data.get('eventType') ?? '').trim();
  const eventCause = String(data.get('eventCause') ?? '').trim();
  const location = String(data.get('location') ?? '').trim();
  const latitude = Number(data.get('latitude'));
  const longitude = Number(data.get('longitude'));
  const crowdSize = Number(data.get('crowdSize') ?? 0);
  const startTime = new Date(String(data.get('startTime') ?? ''));
  const endTime = new Date(String(data.get('endTime') ?? ''));
  const statusLabel = String(data.get('status') ?? 'Scheduled').trim();

  if (!eventName || !eventTypeLabel || !location || Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(crowdSize) || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return {
      success: false,
      error: 'Please fill in all required fields with valid values.',
    };
  }

  const eventType = EVENT_TYPE_MAP[eventTypeLabel] ?? 'OTHER';
  const status = EVENT_STATUS_MAP[statusLabel] ?? 'SCHEDULED';

  try {
    // 2. Save event in the DB
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

    // 3. Prepare payload for FastAPI model
    const eventDatetime = startTime.toISOString();
    const zone = 'Central';
    const junction = location || 'Central Avenue';
    const requiresRoadClosure = crowdSize > 15000 || eventType === 'POLITICAL' || eventType === 'SPORTS';

    const reqPayload = {
      event_type: eventTypeLabel,
      event_cause: eventCause || 'Gathering',
      latitude: latitude,
      longitude: longitude,
      zone: zone,
      junction: junction,
      corridor: 'Unknown',
      police_station: 'Unknown',
      authenticated: 'True',
      veh_type: 'Unknown',
      requires_road_closure: requiresRoadClosure,
      event_datetime: eventDatetime,
    };

    let predictionData = null;

    try {
      // 4. Send request to FastAPI model
      const modelRes = await fetch('  ', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqPayload),
      });

      if (modelRes.ok) {
        predictionData = await modelRes.json();
      } else {
        console.warn('FastAPI model request failed with status:', modelRes.status);
      }
    } catch (fetchErr) {
      console.warn('Could not reach FastAPI model server, using local fallback:', fetchErr.message);
    }

    // 5. Fallback local prediction generator if FastAPI endpoint is unreachable
    if (!predictionData) {
      const crowdWeight = Math.min(35, Math.round(crowdSize / 700));
      const durationHours = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)));
      const durationWeight = Math.min(18, durationHours * 2);
      const closureWeight = requiresRoadClosure ? 14 : 4;
      const zoneWeight = 16;
      const score = Math.min(98, 24 + crowdWeight + durationWeight + closureWeight + zoneWeight);
      
      let severity = 'Moderate';
      if (score >= 85) severity = 'Critical';
      else if (score >= 70) severity = 'High';
      else if (score < 50) severity = 'Low';

      predictionData = {
        severity_score: score,
        hotspot_score: 20000,
        junction_score: 5.0,
        closure_score: requiresRoadClosure ? 100 : 20,
        traffic_score: score * 0.8,
        risk_score: score,
        risk_category: severity,
        resources: {
          officers: Math.max(5, Math.round(score * 0.8)),
          barricades: Math.max(2, Math.round(score * 0.5)),
          tow_vehicles: Math.max(0, Math.round(score * 0.05)),
        },
      };
    }

    // 6. Save prediction in prediction table
    const prediction = await db.prediction.create({
      data: {
        eventId: event.id,
        severityScore: predictionData.severity_score,
        hotspotScore: predictionData.hotspot_score,
        junctionScore: predictionData.junction_score,
        closureScore: predictionData.closure_score,
        riskScore: predictionData.risk_score,
        trafficScore: predictionData.traffic_score,
        riskCategory: predictionData.risk_category,
        officers: predictionData.resources.officers,
        barricades: predictionData.resources.barricades,
        towVehicles: predictionData.resources.tow_vehicles,
      },
    });

    // 7. Revalidate paths to update dashboard and event lists
    revalidatePath('/dashboard');
    revalidatePath('/events');

    return {
      success: true,
      event,
      prediction,
    };
  } catch (error) {
    console.error('Error in createEvent action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
